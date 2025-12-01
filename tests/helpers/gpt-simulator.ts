import {
  GetInsuranceQuotesParams,
  GetInsuranceQuotesResult,
  Quote
} from "./mcp-client";
import carrierQuotes from "../mocks/carrier-quotes.json";
import { PERFORMANCE_BUDGET } from "./config";

export type Speaker = "user" | "gpt";

export interface ConversationTurn {
  speaker: Speaker;
  message: string;
}

export type InsuranceIntent = "get_quote";

export interface LocationEntity {
  city: string;
  state: string;
}

export interface InternalReasoningStep {
  observation: string;
  decision: string;
}

interface InternalReasoningTrace {
  steps: InternalReasoningStep[];
}

export interface ConversationSlots {
  insuranceType?: "auto" | "home" | "life" | "renters";
  zipCode?: string;
  coverageLevel?: "basic" | "standard" | "premium";
  location?: LocationEntity;
  homeValue?: number;
  deductible?: number;
}

export interface ConversationState {
  intent?: InsuranceIntent;
  slots: ConversationSlots;
  awaitingSlot?: keyof ConversationSlots;
  turns: ConversationTurn[];
  internalReasoning: InternalReasoningTrace; // kept internal, not surfaced to end user
}

export interface SimulatedMCPCall {
  toolName: string;
  parameters: GetInsuranceQuotesParams;
}

export interface SimulatedGPTFlowResult {
  mcpCall: SimulatedMCPCall;
  mcpResult: GetInsuranceQuotesResult;
  gptResponse: string;
  totalResponseTime: number;
}

/**
 * Internal helper to append a reasoning step.
 * This simulates hidden chain-of-thought without exposing it in GPT replies.
 */
function pushReasoning(
  state: ConversationState,
  observation: string,
  decision: string
): void {
  state.internalReasoning.steps.push({ observation, decision });
}

// ---------- NLU HELPERS ----------

function extractZip(message: string): string | undefined {
  const zipMatch = message.match(/\b(\d{5})\b/);
  return zipMatch?.[1];
}

function extractInsuranceType(message: string): "auto" | "home" | "life" | "renters" | undefined {
  const lower = message.toLowerCase();
  if (lower.includes("car") || lower.includes("auto")) return "auto";
  if (lower.includes("home") || lower.includes("house")) return "home";
  if (lower.includes("life")) return "life";
  if (lower.includes("renters") || lower.includes("renter")) return "renters";
  return undefined;
}

function extractCoverageLevel(message: string): "basic" | "standard" | "premium" | undefined {
  const lower = message.toLowerCase();
  if (lower.includes("basic")) return "basic";
  if (lower.includes("standard")) return "standard";
  if (lower.includes("premium")) return "premium";
  return undefined;
}

function extractLocation(message: string): LocationEntity | undefined {
  // Very simple pattern: "in Boston, MA" or "at Boston, MA"
  const match = message.match(/\b(?:in|at)\s+([A-Za-z ]+),\s*([A-Z]{2})\b/);
  if (match) {
    const city = match[1].trim();
    const state = match[2].trim();
    return { city, state };
  }
  return undefined;
}

function extractMoneyValues(message: string): number[] {
  // Recognize patterns like "$500k", "$500K", "$500,000", "$1200"
  const values: number[] = [];
  const moneyRegex = /\$(\d[\d,]*)(k|K)?/g;
  let m: RegExpExecArray | null;
  while ((m = moneyRegex.exec(message)) !== null) {
    const raw = m[1].replace(/,/g, "");
    let val = parseFloat(raw);
    if (m[2]) {
      val = val * 1000;
    }
    if (!Number.isNaN(val)) {
      values.push(val);
    }
  }
  return values;
}

function extractHomeValueAndDeductible(message: string): {
  homeValue?: number;
  deductible?: number;
} {
  const moneyValues = extractMoneyValues(message);
  if (!moneyValues.length) return {};

  let homeValue: number | undefined;
  let deductible: number | undefined;

  // Heuristic: if word 'deductible' appears near a money value, treat nearest as deductible
  const idxDeductible = message.toLowerCase().indexOf("deductible");
  if (idxDeductible >= 0) {
    // Find closest money token to 'deductible'
    const moneyRegex = /\$(\d[\d,]*)(k|K)?/g;
    let closestVal: number | undefined;
    let smallestDistance = Number.POSITIVE_INFINITY;
    let m: RegExpExecArray | null;
    while ((m = moneyRegex.exec(message)) !== null) {
      const start = m.index;
      const raw = m[1].replace(/,/g, "");
      let val = parseFloat(raw);
      if (m[2]) {
        val = val * 1000;
      }
      const distance = Math.abs(start - idxDeductible);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestVal = val;
      }
    }
    deductible = closestVal;
  }

  // Home value: first money value that is NOT the deductible
  if (moneyValues.length === 1) {
    // Single money: ambiguous, treat as home value if no 'deductible' context
    if (!deductible) homeValue = moneyValues[0];
  } else {
    homeValue = moneyValues.find(v => v !== deductible) ?? moneyValues[0];
  }

  return { homeValue, deductible };
}

function extractIntent(message: string): InsuranceIntent | undefined {
  const lower = message.toLowerCase();
  if (lower.includes("insurance") || lower.includes("quote")) {
    return "get_quote";
  }
  return undefined;
}

function validateZip(zip: string | undefined): "missing" | "invalid" | "valid" {
  if (!zip) return "missing";
  if (!/^\d{5}$/.test(zip)) return "invalid";
  if (zip === "00000") return "invalid";
  return "valid";
}

// ---------- STATE MACHINE CORE ----------

export function createInitialConversationState(): ConversationState {
  return {
    intent: undefined,
    slots: {},
    awaitingSlot: undefined,
    turns: [],
    internalReasoning: { steps: [] }
  };
}

function applyNLUToState(state: ConversationState, message: string): void {
  const insuranceType = extractInsuranceType(message);
  if (insuranceType && !state.slots.insuranceType) {
    state.slots.insuranceType = insuranceType;
    pushReasoning(
      state,
      `Detected insurance type phrase in: "${message}"`,
      `Set insuranceType=${insuranceType}`
    );
  }

  const zip = extractZip(message);
  if (zip && !state.slots.zipCode) {
    state.slots.zipCode = zip;
    pushReasoning(
      state,
      `Detected ZIP in: "${message}"`,
      `Set zipCode=${zip}`
    );
  }

  const coverage = extractCoverageLevel(message);
  if (coverage && !state.slots.coverageLevel) {
    state.slots.coverageLevel = coverage;
    pushReasoning(
      state,
      `Detected coverage level in: "${message}"`,
      `Set coverageLevel=${coverage}`
    );
  }

  const location = extractLocation(message);
  if (location && !state.slots.location) {
    state.slots.location = location;
    pushReasoning(
      state,
      `Detected location in: "${message}"`,
      `Set location=${location.city},${location.state}`
    );
  }

  const { homeValue, deductible } = extractHomeValueAndDeductible(message);
  if (homeValue && !state.slots.homeValue) {
    state.slots.homeValue = homeValue;
    pushReasoning(
      state,
      `Detected home value in: "${message}"`,
      `Set homeValue=${homeValue}`
    );
  }
  if (deductible && !state.slots.deductible) {
    state.slots.deductible = deductible;
    pushReasoning(
      state,
      `Detected deductible in: "${message}"`,
      `Set deductible=${deductible}`
    );
  }

  const intent = extractIntent(message);
  if (intent && !state.intent) {
    state.intent = intent;
    pushReasoning(
      state,
      `Detected insurance intent in: "${message}"`,
      `Set intent=${intent}`
    );
  }
}

function needRequiredSlots(state: ConversationState): Array<keyof ConversationSlots> {
  // For now, treat auto/home/life/renters similarly in required slot logic
  const required: Array<keyof ConversationSlots> = ["insuranceType", "zipCode"];
  return required;
}

function ensureDefaults(state: ConversationState): void {
  if (!state.slots.coverageLevel) {
    state.slots.coverageLevel = "standard";
    pushReasoning(
      state,
      "Coverage level not explicitly provided",
      "Default coverageLevel=standard"
    );
  }
}

interface ProcessUserTurnResult {
  state: ConversationState;
  gptReply?: string;
  mcpCall?: SimulatedMCPCall;
}

/**
 * Process a single user message through the state machine:
 * - Apply NLU
 * - Decide whether to ask a question (repair / missing info)
 * - Or whether we can call the MCP tool
 */
export function processUserTurn(
  prevState: ConversationState,
  userMessage: string
): ProcessUserTurnResult {
  const state: ConversationState = {
    ...prevState,
    slots: { ...prevState.slots },
    internalReasoning: {
      steps: [...prevState.internalReasoning.steps]
    },
    turns: [...prevState.turns, { speaker: "user", message: userMessage }]
  };

  applyNLUToState(state, userMessage);

  // If we are awaiting a specific slot, prioritize repair/fulfilment for that
  if (state.awaitingSlot === "zipCode") {
    const zip = extractZip(userMessage);
    const zipStatus = validateZip(zip);
    if (zipStatus === "invalid") {
      const reply =
        "That ZIP code seems invalid. Could you provide a valid 5-digit US ZIP code?";
      state.turns.push({ speaker: "gpt", message: reply });
      pushReasoning(
        state,
        `User provided invalid ZIP: ${zip}`,
        "Ask for a valid 5-digit ZIP"
      );
      return { state, gptReply: reply };
    }
    if (zipStatus === "missing") {
      const reply =
        "I didn't catch your ZIP code. Please provide a valid 5-digit US ZIP code.";
      state.turns.push({ speaker: "gpt", message: reply });
      pushReasoning(
        state,
        "Still no ZIP after user reply",
        "Ask again for ZIP"
      );
      return { state, gptReply: reply };
    }
    // valid
    state.slots.zipCode = zip!;
    state.awaitingSlot = undefined;
    pushReasoning(
      state,
      `User provided valid ZIP while awaiting zipCode: ${zip}`,
      "Clear awaitingSlot"
    );
  }

  // Determine which required slots are missing
  const required = needRequiredSlots(state);
  const missing = required.filter(key => !state.slots[key]);

  if (missing.length > 0) {
    // Ask for the highest-priority missing slot. For now, ZIP is critical.
    if (missing.includes("zipCode")) {
      state.awaitingSlot = "zipCode";
      const reply =
        "I can help with that. What's your ZIP code so I can find carriers in your area?";
      state.turns.push({ speaker: "gpt", message: reply });
      pushReasoning(
        state,
        "Missing required slot zipCode",
        "Ask user for ZIP code"
      );
      return { state, gptReply: reply };
    }
  }

  // We have enough to proceed
  ensureDefaults(state);

  const params: GetInsuranceQuotesParams = {
    insuranceType: state.slots.insuranceType || "auto",
    zipCode: state.slots.zipCode || "00000",
    coverageLevel: state.slots.coverageLevel,
    additionalDetails: {}
  };

  if (state.slots.location) {
    params.additionalDetails = {
      ...(params.additionalDetails || {}),
      location: state.slots.location
    };
  }
  if (state.slots.homeValue) {
    params.additionalDetails = {
      ...(params.additionalDetails || {}),
      homeValue: state.slots.homeValue
    };
  }
  if (state.slots.deductible) {
    params.additionalDetails = {
      ...(params.additionalDetails || {}),
      deductible: state.slots.deductible
    };
  }

  const mcpCall: SimulatedMCPCall = {
    toolName: "get_insurance_quotes",
    parameters: params
  };

  pushReasoning(
    state,
    "All required slots present",
    `Invoke MCP tool get_insurance_quotes with ${JSON.stringify(params)}`
  );

  return { state, mcpCall };
}

// ---------- BACKEND + RENDERING MOCKS ----------

export function mockMCPExecution(
  params: GetInsuranceQuotesParams
): GetInsuranceQuotesResult {
  const { zipCode } = params;

  if (zipCode === "00000") {
    throw Object.assign(new Error("Invalid ZIP code"), {
      code: "INVALID_INPUT"
    });
  }

  let quotes: Quote[] = [];

  if (zipCode === "99999") {
    quotes = [];
  } else if (carrierQuotes[zipCode as keyof typeof carrierQuotes]) {
    quotes = carrierQuotes[zipCode as keyof typeof carrierQuotes] as Quote[];
  } else {
    quotes = carrierQuotes["DEFAULT"] as Quote[];
  }

  const responseTime = Math.min(
    500 + Math.floor(Math.random() * 500),
    PERFORMANCE_BUDGET.backendMs
  );

  return { quotes, responseTime };
}

export function formatGPTResponse(
  result: GetInsuranceQuotesResult,
  zip: string
): string {
  const available = result.quotes.filter(q => q.status === "available");
  const unavailable = result.quotes.filter(q => q.status === "unavailable");
  const timeouts = result.quotes.filter(q => q.status === "timeout");

  if (!available.length) {
    return `Unfortunately, no carriers cover ZIP ${zip} right now. Try a different ZIP code or contact us for manual assistance.`;
  }

  const lines: string[] = [];
  lines.push(`Here are your auto insurance quotes for ${zip}:`);
  lines.push("");

  if (available.length) {
    const sorted = [...available].sort((a, b) => a.premium - b.premium);
    const best = sorted[0];
    lines.push("🏆 **Best Value**");
    lines.push(`${best.carrier}: $${best.premium.toLocaleString()}/year`);
    if (best.coverageDetails.liability) {
      lines.push(`✓ Liability: ${best.coverageDetails.liability}`);
    }
    if (best.coverageDetails.collisionDeductible != null) {
      lines.push(
        `✓ Collision: $${best.coverageDetails.collisionDeductible} deductible`
      );
    }
    if (best.coverageDetails.comprehensive) {
      lines.push("✓ Comprehensive: Included");
    }
    lines.push("[Select This Quote]");
    lines.push("");

    for (const quote of sorted.slice(1)) {
      lines.push(`${quote.carrier}: $${quote.premium.toLocaleString()}/year`);
      if (quote.coverageDetails.liability) {
        lines.push(`✓ Liability: ${quote.coverageDetails.liability}`);
      }
      if (quote.coverageDetails.collisionDeductible != null) {
        lines.push(
          `✓ Collision: $${quote.coverageDetails.collisionDeductible} deductible`
        );
      }
      if (quote.coverageDetails.comprehensive) {
        lines.push("✓ Comprehensive: Included");
      }
      lines.push("[Select This Quote]");
      lines.push("");
    }
  }

  if (unavailable.length || timeouts.length) {
    lines.push("Notes:");
    for (const q of unavailable) {
      lines.push(`- ${q.carrier}: ${q.reason || "Unavailable"}`);
    }
    for (const q of timeouts) {
      lines.push(`- ${q.carrier}: quote unavailable due to timeout.`);
    }
  }

  lines.push("");
  lines.push("Would you like more details on any of these?");

  return lines.join("\n");
}

// ---------- SINGLE-TURN COMPAT WRAPPER ----------

/**
 * Backwards compatible single-turn GPT processing.
 * Uses the state machine under the hood but assumes a one-shot message
 * that already contains required information.
 */
export function simulateGPTProcessing(userMessage: string): SimulatedMCPCall {
  const initial = createInitialConversationState();
  const { mcpCall } = processUserTurn(initial, userMessage);

  if (!mcpCall) {
    throw new Error(
      "simulateGPTProcessing: Unable to build MCP call from single message; required slots missing."
    );
  }

  return mcpCall;
}

// ---------- STATEFUL CONVERSATION DRIVER ----------

export async function runStatefulConversation(
  userMessages: string[]
): Promise<
  SimulatedGPTFlowResult & { transcript: ConversationTurn[]; state: ConversationState }
> {
  const start = Date.now();
  let state = createInitialConversationState();
  let lastMcpCall: SimulatedMCPCall | undefined;
  let lastGptReply: string | undefined;

  for (const msg of userMessages) {
    const { state: nextState, gptReply, mcpCall } = processUserTurn(
      state,
      msg
    );
    state = nextState;
    if (gptReply) {
      lastGptReply = gptReply;
    }
    if (mcpCall) {
      lastMcpCall = mcpCall;
      break; // Once we decide to call MCP, we end this simulated conversation
    }
  }

  if (!lastMcpCall) {
    throw new Error(
      "runStatefulConversation: Conversation ended without enough information to call MCP."
    );
  }

  const mcpResult = mockMCPExecution(lastMcpCall.parameters);
  const gptResponse = formatGPTResponse(
    mcpResult,
    lastMcpCall.parameters.zipCode
  );
  const totalResponseTime = Date.now() - start;

  // Also push the final GPT response into transcript
  state.turns.push({ speaker: "gpt", message: gptResponse });

  return {
    mcpCall: lastMcpCall,
    mcpResult,
    gptResponse,
    totalResponseTime,
    transcript: state.turns,
    state
  };
}

/**
 * Existing helper used by earlier tests: wraps a single user message
 * and drives the whole flow with the state machine.
 */
export async function runSimulatedConversationFlow(
  userMessage: string
): Promise<SimulatedGPTFlowResult> {
  const result = await runStatefulConversation([userMessage]);
  return {
    mcpCall: result.mcpCall,
    mcpResult: result.mcpResult,
    gptResponse: result.gptResponse,
    totalResponseTime: result.totalResponseTime
  };
}
