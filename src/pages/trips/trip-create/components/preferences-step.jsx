import { AuthorMessage, Image } from "@/components/shared/utils";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import {
  useTripAgentActiveMutation,
  useTripAgentCreateMessageMutation,
} from "@/features/trips/tripApiSlice";
import { useUserProfileQuery } from "@/features/auth/authApiSlice";
import { Loader2, Send, Sparkles } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { planningStepValues } from "../planning-step-utils";
import {
  DIETARY_OPTIONS,
  MOBILITY_OPTIONS,
  TRAVEL_INTEREST_OPTIONS,
  TRAVEL_PACE_OPTIONS,
} from "../../constants";
import { useTripPlanningStep } from "../hooks/use-trip-planning-step";

const EMPTY_LIST = [];

const unwrapAgentResponse = (response) => response?.data || response || {};

const normalizeListToOptions = (
  values,
  options,
  { preserveUnknown = false } = {},
) => {
  const optionMap = new Map(
    options.map((option) => [option.toLowerCase(), option]),
  );

  return (Array.isArray(values) ? values : [])
    .map((value) => {
      const normalizedValue = String(value || "").trim();
      return (
        optionMap.get(normalizedValue.toLowerCase()) ||
        (preserveUnknown ? normalizedValue : null)
      );
    })
    .filter(Boolean);
};

const mergeOptions = (defaultOptions, additionalOptions) => {
  const seen = new Set();

  return [...defaultOptions, ...additionalOptions].filter((option) => {
    const key = option.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const normalizeTravelPace = (value) => {
  const pace = String(value || "").toLowerCase();

  if (pace === "fast") return "packed";
  if (pace === "slow") return "relaxed";
  if (pace === "balanced") return "moderate";

  return pace;
};

const getHandoffTravelPace = (handoff) => {
  const explicitPace = handoff?.travel_pace || handoff?.trip_pace;
  const interestPace = (Array.isArray(handoff?.interests)
    ? handoff.interests
    : []
  ).find((interest) =>
    ["relaxed", "slow", "moderate", "balanced", "packed", "fast"].includes(
      String(interest).toLowerCase(),
    ),
  );

  return normalizeTravelPace(explicitPace || interestPace);
};

const getInitialAgentMessages = (trip) =>
  trip?.agent_active && trip?.agent_message
    ? [{ role: "agent", content: trip.agent_message }]
    : [];

const unwrapAgentMessages = (response) => {
  const payload = unwrapAgentResponse(response);
  const messages = Array.isArray(payload?.messages)
    ? payload.messages
    : Array.isArray(payload)
      ? payload
      : [];

  return [...messages]
    .sort((first, second) => {
      if (first.sequence !== undefined || second.sequence !== undefined) {
        return Number(first.sequence || 0) - Number(second.sequence || 0);
      }

      return new Date(first.created_at || 0) - new Date(second.created_at || 0);
    })
    .map((item) => ({
      id: item.id,
      role:
        item.sender === "system"
          ? "system"
          : item.sender === "user"
            ? "user"
            : "agent",
      content: item.content,
      metadata: item.metadata || {},
    }))
    .filter((item) => item.content);
};

const getMessageKey = (message) =>
  message.id || `${message.role}-${message.content}`;

const getMessageContentKey = (message) => `${message.role}-${message.content}`;

const mergeConversationMessages = (serverMessages, localMessages) => {
  const seenServerMessages = new Set();
  const serverMessageContent = new Set(
    serverMessages.map(getMessageContentKey),
  );
  const mergedServerMessages = serverMessages.filter((message) => {
    const key = getMessageKey(message);

    if (seenServerMessages.has(key)) return false;
    seenServerMessages.add(key);
    return true;
  });
  const seenLocalMessages = new Set();
  const pendingLocalMessages = localMessages.filter((message) => {
    if (serverMessageContent.has(getMessageContentKey(message))) return false;

    const key = getMessageKey(message);

    if (seenLocalMessages.has(key)) return false;
    seenLocalMessages.add(key);
    return true;
  });

  return [...mergedServerMessages, ...pendingLocalMessages];
};

const SystemMessageDivider = ({ message }) => (
  <div className="flex items-center gap-3 py-2">
    <span className="h-px flex-1 bg-slate-200" />
    <span className="max-w-[72%] rounded-full bg-white px-3 text-center text-[11px] font-semibold leading-5 text-slate-500">
      {message}
    </span>
    <span className="h-px flex-1 bg-slate-200" />
  </div>
);

const ToggleOption = ({ selected, children, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
        selected
          ? "border-primary bg-primary text-white"
          : "border-slate-200 bg-white text-slate-700 hover:border-primary/40"
      }`}
    >
      {children}
    </button>
  );
};

const OptionGroup = ({ title, children }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      {children}
    </div>
  );
};

const AgentThinkingMessage = () => (
  <div className="flex w-full justify-start">
    <div className="flex max-w-[88%] flex-row items-start gap-2">
      <div className="mt-1 flex size-8 shrink-0">
        <img src="/logo.png" className="h-full object-contain" />
      </div>
      <div className="w-fit rounded-xl rounded-tl-md bg-primary/10 px-4 py-3 text-sm text-slate-700">
        <span className="text-primary text-xs font-semibold uppercase tracking-wider">
          Turtle
        </span>
        <div className="mt-2 flex items-center gap-2">
          <Loader2 className="animate-spin text-primary" size={15} />
          <span>Agent is thinking...</span>
        </div>
      </div>
    </div>
  </div>
);

const PreferencesStep = ({
  trip,
  planningHandoff,
  onStepComplete,
  onStepSelect,
  onPlanningStateChange,
}) => {
  const authenticatedUser = useSelector((state) => state.auth.user);
  const { data: userProfileResponse } = useUserProfileQuery(
    { username: authenticatedUser?.username },
    { skip: !authenticatedUser?.username },
  );
  const user = userProfileResponse?.data || userProfileResponse;

  // user specific
  const profileImage = user?.avatar_url;
  const userTravelInterests = user?.travel_interests || EMPTY_LIST;
  const userDietaryPreferences = user?.dietary_preferences || EMPTY_LIST;
  const userMobilityConstraints = user?.mobility_constraints || EMPTY_LIST;
  const userTravelPace = user?.travel_pace
    ? String(user.travel_pace).toLowerCase()
    : "";
  const handoffTravelInterests = useMemo(
    () =>
      normalizeListToOptions(
        planningHandoff?.interests,
        TRAVEL_INTEREST_OPTIONS,
        { preserveUnknown: true },
      ),
    [planningHandoff?.interests],
  );
  const handoffDietaryPreferences = useMemo(
    () =>
      normalizeListToOptions(
        planningHandoff?.dietary_preferences,
        DIETARY_OPTIONS,
        { preserveUnknown: true },
      ),
    [planningHandoff?.dietary_preferences],
  );
  const handoffMobilityConstraints = useMemo(
    () =>
      normalizeListToOptions(
        planningHandoff?.mobility_constraints,
        MOBILITY_OPTIONS,
        { preserveUnknown: true },
      ),
    [planningHandoff?.mobility_constraints],
  );
  const availableTravelInterestOptions = useMemo(
    () => mergeOptions(TRAVEL_INTEREST_OPTIONS, handoffTravelInterests),
    [handoffTravelInterests],
  );
  const availableDietaryOptions = useMemo(
    () => mergeOptions(DIETARY_OPTIONS, handoffDietaryPreferences),
    [handoffDietaryPreferences],
  );
  const availableMobilityOptions = useMemo(
    () => mergeOptions(MOBILITY_OPTIONS, handoffMobilityConstraints),
    [handoffMobilityConstraints],
  );

  // trip specific
  const tripId = trip?.id;
  // preference
  const {
    payload: planningPayload,
    isFetching: isPreferenceFetching,
    isError: isPreferenceError,
  } = useTripPlanningStep({
    tripId,
    step: planningStepValues.preference,
    onPlanningStateChange,
  });
  const savedPreferences = planningPayload.preferences || {};
  const tripTravelInterests = savedPreferences.interest_tags;
  const tripDietaryPreferences = savedPreferences.dietary_needs;
  const tripMobilityConstraints = savedPreferences.mobility_constraints;
  const tripTravelPace = savedPreferences.travel_pace;
  const planningSession = planningPayload?.session || null;
  const serverMessages = useMemo(
    () => unwrapAgentMessages(planningPayload),
    [planningPayload],
  );
  const hasTripPreferences = Boolean(
    tripTravelPace ||
    Array.isArray(tripTravelInterests) ||
    Array.isArray(tripDietaryPreferences) ||
    Array.isArray(tripMobilityConstraints),
  );
  const hasSavedPlanningPreferences = Boolean(
    tripTravelPace ||
    tripTravelInterests?.length ||
    tripDietaryPreferences?.length ||
    tripMobilityConstraints?.length ||
    savedPreferences.dietary_other ||
    savedPreferences.mobility_other,
  );
  const preferenceSource = useMemo(() => {
    if (hasTripPreferences && (!planningHandoff || hasSavedPlanningPreferences)) {
      return {
        travel_pace: normalizeTravelPace(tripTravelPace),
        interest_tags: normalizeListToOptions(
          tripTravelInterests,
          TRAVEL_INTEREST_OPTIONS,
          { preserveUnknown: Boolean(planningHandoff) },
        ),
        dietary_needs: normalizeListToOptions(
          tripDietaryPreferences,
          DIETARY_OPTIONS,
          { preserveUnknown: Boolean(planningHandoff) },
        ),
        dietary_other: savedPreferences.dietary_other || "",
        mobility_constraints: normalizeListToOptions(
          tripMobilityConstraints,
          MOBILITY_OPTIONS,
          { preserveUnknown: Boolean(planningHandoff) },
        ),
        mobility_other: savedPreferences.mobility_other || "",
      };
    }

    if (planningHandoff) {
      return {
        travel_pace:
          getHandoffTravelPace(planningHandoff) ||
          normalizeTravelPace(userTravelPace),
        interest_tags: handoffTravelInterests.length
          ? handoffTravelInterests
          : normalizeListToOptions(
              userTravelInterests,
              TRAVEL_INTEREST_OPTIONS,
            ),
        dietary_needs: handoffDietaryPreferences.length
          ? handoffDietaryPreferences
          : normalizeListToOptions(userDietaryPreferences, DIETARY_OPTIONS),
        dietary_other: "",
        mobility_constraints: handoffMobilityConstraints.length
          ? handoffMobilityConstraints
          : normalizeListToOptions(userMobilityConstraints, MOBILITY_OPTIONS),
        mobility_other: "",
      };
    }

    return {
      travel_pace: normalizeTravelPace(userTravelPace),
      interest_tags: normalizeListToOptions(
        userTravelInterests,
        TRAVEL_INTEREST_OPTIONS,
      ),
      dietary_needs: normalizeListToOptions(
        userDietaryPreferences,
        DIETARY_OPTIONS,
      ),
      dietary_other: "",
      mobility_constraints: normalizeListToOptions(
        userMobilityConstraints,
        MOBILITY_OPTIONS,
      ),
      mobility_other: "",
    };
  }, [
    handoffDietaryPreferences,
    handoffMobilityConstraints,
    handoffTravelInterests,
    hasSavedPlanningPreferences,
    hasTripPreferences,
    planningHandoff,
    savedPreferences.dietary_other,
    savedPreferences.mobility_other,
    tripDietaryPreferences,
    tripMobilityConstraints,
    tripTravelInterests,
    tripTravelPace,
    userDietaryPreferences,
    userMobilityConstraints,
    userTravelInterests,
    userTravelPace,
  ]);

  const [draftPreferences, setDraftPreferences] = useState(preferenceSource);
  const hasEditedPreferencesRef = useRef(false);
  const resolvedTravelPace = draftPreferences.travel_pace;
  const resolvedInterests = draftPreferences.interest_tags;
  const resolvedDietaryNeeds = draftPreferences.dietary_needs;
  const resolvedDietaryOther = draftPreferences.dietary_other;
  const resolvedMobilityConstraints = draftPreferences.mobility_constraints;
  const resolvedMobilityOther = draftPreferences.mobility_other;

  const [agentMessages, setAgentMessages] = useState([]);
  const conversationMessages = useMemo(
    () =>
      mergeConversationMessages(
        serverMessages.length ? serverMessages : getInitialAgentMessages(trip),
        agentMessages,
      ),
    [agentMessages, serverMessages, trip],
  );
  const conversationMessageCount = conversationMessages.length;
  const [agentFailureMessage, setAgentFailureMessage] = useState(
    trip?.agent_active === false ? trip?.agent_active_failed_message || "" : "",
  );
  const [localAgentActive, setLocalAgentActive] = useState(null);
  const [localSessionId, setLocalSessionId] = useState("");

  const [message, setMessage] = useState("");
  const conversationEndRef = useRef(null);
  const previousConversationMessageCountRef = useRef(0);
  const hasInitializedConversationScrollRef = useRef(false);

  const [activateAgent, { isLoading: isActivatingAgent }] =
    useTripAgentActiveMutation();

  const [createAgentMessage, { isLoading: isSendingMessage }] =
    useTripAgentCreateMessageMutation();

  const [isLocallyStepComplete, setIsLocallyStepComplete] = useState(false);
  const serverAgentActive =
    typeof planningPayload?.agent_active === "boolean"
      ? planningPayload.agent_active
      : trip?.agent_active === true
        ? true
        : undefined;
  const isAgentActive =
    localAgentActive ??
    serverAgentActive ??
    Boolean(planningSession || serverMessages.length);
  const isStepComplete =
    isLocallyStepComplete ||
    planningPayload?.is_step_complete === true ||
    planningPayload?.is_qna_complete === true;
  const displayedAgentFailureMessage =
    !isAgentActive && planningPayload?.agent_active === false
      ? agentFailureMessage ||
        planningPayload.agent_active_failed_message ||
        "The agent could not start."
      : agentFailureMessage;

  const isConversationAvailable =
    isAgentActive || Boolean(planningSession) || Boolean(serverMessages.length);

  const isAgentThinking = isActivatingAgent || isSendingMessage;

  useEffect(() => {
    if (hasEditedPreferencesRef.current) return;
    setDraftPreferences(preferenceSource);
  }, [preferenceSource]);

  useEffect(() => {
    if (isPreferenceFetching) return;

    if (!hasInitializedConversationScrollRef.current) {
      hasInitializedConversationScrollRef.current = true;
      previousConversationMessageCountRef.current = conversationMessageCount;
      return;
    }

    const hasNewMessage =
      conversationMessageCount > previousConversationMessageCountRef.current;

    previousConversationMessageCountRef.current = conversationMessageCount;

    if (!hasNewMessage) return;

    conversationEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [conversationMessageCount, isPreferenceFetching]);

  const toggleListValue = (list, value) =>
    list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];

  const updatePreferenceField = (key, value) => {
    hasEditedPreferencesRef.current = true;
    setDraftPreferences((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const buildPayload = ({ letAgentDecide = false } = {}) => {
    const payload = {
      trip_id: tripId,
      let_agent_decide: letAgentDecide,
    };

    if (letAgentDecide) return payload;

    return {
      ...payload,
      travel_pace:
        resolvedTravelPace === "moderate" ? "balanced" : resolvedTravelPace,
      accommodation_preference:
        trip?.accommodation_preference ||
        trip?.preferences?.accommodation_preference ||
        trip?.preferences?.accommotation_preference ||
        "",
      interest_tags: resolvedInterests,
      dietary_needs: resolvedDietaryNeeds,
      dietary_other: resolvedDietaryNeeds.includes("Other")
        ? resolvedDietaryOther
        : "",
      mobility_constraints: resolvedMobilityConstraints,
      mobility_other: resolvedMobilityConstraints.includes("Other")
        ? resolvedMobilityOther
        : "",
    };
  };

  const handleAgentResponse = (response) => {
    const data = unwrapAgentResponse(response);
    onPlanningStateChange?.(data);
    setLocalSessionId(data.session_id || data.preferences?.session_id || "");

    if (data.agent_active === false) {
      setLocalAgentActive(false);
      setAgentFailureMessage(
        data.agent_active_failed_message || "The agent could not start.",
      );
      return;
    }

    setAgentFailureMessage("");
    setLocalAgentActive(data.agent_active !== false);

    if (data.agent_message) {
      setAgentMessages((current) => [
        ...current,
        { role: "agent", content: data.agent_message },
      ]);
    }

    if (data?.is_step_complete || data?.is_qna_complete) {
      setIsLocallyStepComplete(true);
    }
  };

  const handleActivateAgent = async () => {
    if (!tripId) {
      toast.error("Trip id is missing.");
      return;
    }

    if (!resolvedTravelPace) {
      toast.error("Choose a travel pace ");
      return;
    }

    try {
      const response = await activateAgent(buildPayload()).unwrap();
      handleAgentResponse(response);
    } catch (error) {
      toast.error(error?.data?.message || "Could not activate the agent.");
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;
    const sessionId =
      localSessionId ||
      planningPayload?.session?.id ||
      planningPayload?.session_id ||
      savedPreferences?.session_id;

    if (!sessionId) {
      toast.error("The preference session is not ready yet.");
      return;
    }

    const userMessage = { role: "user", content: trimmedMessage };
    setAgentMessages((current) => [...current, userMessage]);
    setMessage("");

    try {
      const response = await createAgentMessage({
        trip_id: tripId,
        session_id: sessionId,
        message: trimmedMessage,
      }).unwrap();
      handleAgentResponse(response);
    } catch (error) {
      toast.error(error?.data?.message || "Could not send message.");
    }
  };

  return (
    <div className="flex min-h-0 flex-col md:h-full">
      <div className="custom-scrollbar space-y-4 p-4 md:min-h-0 md:flex-1 md:overflow-y-auto md:[scrollbar-gutter:stable]">
        <AuthorMessage message="Great. I have your basic trip details. Now I'll understand what kind of trip experience you want so I can recommend the right places, food, activities, and pace." />

        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-4">
          <OptionGroup title="Travel Pace">
            <div className="grid gap-2">
              {TRAVEL_PACE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    updatePreferenceField("travel_pace", option.value)
                  }
                  className={`rounded-xl border p-3 text-left transition ${
                    resolvedTravelPace === option.value
                      ? "border-primary bg-primary/10"
                      : "border-slate-200 hover:border-primary/40"
                  }`}
                >
                  <span className="block text-sm font-semibold text-slate-950">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-slate-600">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </OptionGroup>

          <OptionGroup title="Interest Tags">
            <div className="flex flex-wrap gap-2">
              {availableTravelInterestOptions.map((option) => (
                <ToggleOption
                  key={option}
                  selected={resolvedInterests.includes(option)}
                  onClick={() =>
                    updatePreferenceField(
                      "interest_tags",
                      toggleListValue(resolvedInterests, option),
                    )
                  }
                >
                  {option}
                </ToggleOption>
              ))}
            </div>
          </OptionGroup>

          <OptionGroup title="Dietary Needs">
            <div className="flex flex-wrap gap-2">
              {availableDietaryOptions.map((option) => (
                <ToggleOption
                  key={option}
                  selected={resolvedDietaryNeeds.includes(option)}
                  onClick={() =>
                    updatePreferenceField(
                      "dietary_needs",
                      toggleListValue(resolvedDietaryNeeds, option),
                    )
                  }
                >
                  {option}
                </ToggleOption>
              ))}
            </div>
            {resolvedDietaryNeeds.includes("Other") && (
              <FloatingInput
                name="dietary-other"
                label="Other dietary need"
                value={resolvedDietaryOther}
                onChange={(event) =>
                  updatePreferenceField("dietary_other", event.target.value)
                }
              />
            )}
          </OptionGroup>

          <OptionGroup title="Mobility Constraints">
            <div className="flex flex-wrap gap-2">
              {availableMobilityOptions.map((option) => (
                <ToggleOption
                  key={option}
                  selected={resolvedMobilityConstraints.includes(option)}
                  onClick={() =>
                    updatePreferenceField(
                      "mobility_constraints",
                      toggleListValue(resolvedMobilityConstraints, option),
                    )
                  }
                >
                  {option}
                </ToggleOption>
              ))}
            </div>
            {resolvedMobilityConstraints.includes("Other") && (
              <FloatingInput
                name="mobility-other"
                label="Other mobility constraint"
                value={resolvedMobilityOther}
                onChange={(event) =>
                  updatePreferenceField("mobility_other", event.target.value)
                }
              />
            )}
          </OptionGroup>

          {displayedAgentFailureMessage && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
              {displayedAgentFailureMessage}
            </div>
          )}
        </div>

        {isPreferenceError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
            Could not load preference conversation. Try reopening this step in a
            moment.
          </div>
        )}

        {(isConversationAvailable || isAgentThinking) && (
          <div className="space-y-3 pb-2">
            {isPreferenceFetching && !conversationMessages.length && (
              <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
                <Loader2 className="animate-spin text-primary" size={16} />
                Loading conversation...
              </div>
            )}

            {conversationMessages.map((item, index) => {
              if (item.role === "system") {
                return (
                  <SystemMessageDivider
                    key={item.id || `${item.role}-${index}`}
                    message={item.content}
                  />
                );
              }

              const isUser = item.role === "user";

              return (
                <div
                  key={item.id || `${item.role}-${index}`}
                  className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex max-w-[88%] gap-2 ${
                      isUser
                        ? "flex-row-reverse items-end"
                        : "flex-row items-start"
                    }`}
                  >
                    {!isUser ? (
                      <div className="mt-1 flex size-8 shrink-0">
                        <img
                          src="/logo.png"
                          className="h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex size-8 rounded-full overflow-hidden shrink-0">
                        <Image src={profileImage} width={60} />
                      </div>
                    )}

                    <div
                      className={`w-fit rounded-xl px-4 py-3 text-sm ${
                        isUser
                          ? "rounded-br-md bg-primary text-white"
                          : "rounded-tl-md bg-primary/10 text-slate-700"
                      }`}
                    >
                      {!isUser && (
                        <>
                          <span className="text-primary font-semibold text-xs uppercase tracking-wider">
                            Turtle
                          </span>
                          <br />
                        </>
                      )}
                      <p className="md:leading-6">{item.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {isAgentThinking && !isStepComplete && <AgentThinkingMessage />}
            <div ref={conversationEndRef} />
          </div>
        )}
      </div>

      {!isAgentActive ? (
        <div className="grid grid-cols-1 gap-3 border-t border-slate-200 bg-white p-4 md:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onStepSelect?.(0)}
            className="rounded-full order-2 md:order-1"
          >
            Initial Info
          </Button>
          <Button
            type="button"
            onClick={handleActivateAgent}
            disabled={isActivatingAgent || isStepComplete}
            className="rounded-full order-1 md:order-2"
          >
            {isActivatingAgent ? (
              <Loader2 className="animate-spin" size={17} />
            ) : null}
            Start Planning
          </Button>
        </div>
      ) : isStepComplete ? (
        <div className="grid grid-cols-1 gap-3 border-t border-slate-200 bg-white p-4 md:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onStepSelect?.(0)}
            className="rounded-full order-2 md:order-1"
          >
            Initial Info
          </Button>
          <Button
            type="button"
            onClick={() => onStepComplete?.()}
            className="rounded-full order-1 md:order-2"
          >
            See recommendation
          </Button>
        </div>
      ) : (
        <form
          onSubmit={handleSendMessage}
          className="flex gap-2 border-t border-slate-200 bg-white p-4"
        >
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Reply to the trip agent..."
            disabled={isSendingMessage}
            className="h-11 min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full"
            disabled={isSendingMessage}
          >
            {isSendingMessage ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <Send size={17} />
            )}
          </Button>
        </form>
      )}
    </div>
  );
};

export default PreferencesStep;
