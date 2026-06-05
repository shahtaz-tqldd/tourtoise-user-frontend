import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import {
  useTripAgentActiveMutation,
  useTripAgentCreateMessageMutation,
  useTripAgentMessageListQuery,
} from "@/features/trips/tripApiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

const travelPaceOptions = [
  {
    value: "relaxed",
    label: "Relaxed",
    description: "Fewer activities, more rest time, slower movement.",
  },
  {
    value: "moderate",
    label: "Moderate",
    description: "Balanced plan with enough activities and breathing room.",
  },
  {
    value: "packed",
    label: "Packed",
    description: "More attractions and activities per day.",
  },
];

const interestOptions = [
  "Food",
  "History",
  "Nature",
  "Nightlife",
  "Adventure",
  "Shopping",
  "Culture",
  "Beaches",
  "Photography",
  "Local experiences",
  "Family-friendly activities",
  "Luxury experiences",
  "Hidden gems",
];

const dietaryOptions = [
  "No restriction",
  "Vegetarian",
  "Vegan",
  "Halal",
  "Gluten-free",
  "Seafood allergy",
  "Nut allergy",
  "Avoid pork",
  "Other",
];

const mobilityOptions = [
  "No mobility constraints",
  "Avoid long walking",
  "Avoid stairs",
  "Wheelchair-friendly places preferred",
  "Senior-friendly plan",
  "Kid-friendly pacing",
  "Avoid intense physical activities",
  "Other",
];

const getTripId = (trip) => trip?.id || trip?.trip_id || trip?.uuid;

const unwrapAgentResponse = (response) => response?.data || response || {};

const getPreferenceList = (preferences, key) =>
  Array.isArray(preferences?.[key]) ? preferences[key] : [];

const getUserList = (user, ...keys) => {
  const value = keys.map((key) => user?.[key]).find(Array.isArray);
  return Array.isArray(value) ? value : [];
};

const normalizeListToOptions = (values, options) => {
  const optionMap = new Map(
    options.map((option) => [option.toLowerCase(), option]),
  );

  return values
    .map((value) => optionMap.get(String(value).toLowerCase()))
    .filter(Boolean);
};

const getInitialAgentMessages = (trip) =>
  trip?.agent_active && trip?.agent_message
    ? [{ role: "agent", content: trip.agent_message }]
    : [];

const unwrapAgentMessages = (response) => {
  const messages = Array.isArray(response?.data) ? response.data : [];

  return [...messages]
    .sort((first, second) => Number(first.sequence) - Number(second.sequence))
    .map((item) => ({
      id: item.id,
      role: item.sender === "user" ? "user" : "agent",
      content: item.content,
    }))
    .filter((item) => item.content);
};

const ToggleOption = ({ selected, children, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-sm transition ${
        selected
          ? "border-primary bg-primary/10 text-primary"
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
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      {children}
    </div>
  );
};

const UserProfileStep = ({ trip, onStepComplete }) => {
  const user = useSelector((state) => state.auth.user);
  const preferences = trip?.preferences || {};
  const tripId = getTripId(trip);
  const userTravelPace = user?.travel_pace
    ? String(user.travel_pace).toLowerCase()
    : "";
  const initialInterests = getPreferenceList(preferences, "interest_tags");
  const initialDietaryNeeds = getPreferenceList(preferences, "dietary_needs");
  const initialMobilityConstraints = getPreferenceList(
    preferences,
    "mobility_constraints",
  );
  const [travelPace, setTravelPace] = useState(
    preferences.travel_pace || userTravelPace,
  );
  const [interests, setInterests] = useState(() =>
    initialInterests.length
      ? initialInterests
      : normalizeListToOptions(
          getUserList(user, "travel_interests"),
          interestOptions,
        ),
  );
  const [dietaryNeeds, setDietaryNeeds] = useState(() =>
    initialDietaryNeeds.length
      ? initialDietaryNeeds
      : normalizeListToOptions(
          getUserList(user, "dietary_preferences"),
          dietaryOptions,
        ),
  );
  const [dietaryOther, setDietaryOther] = useState(
    preferences.dietary_other || "",
  );
  const [mobilityConstraints, setMobilityConstraints] = useState(() =>
    initialMobilityConstraints.length
      ? initialMobilityConstraints
      : normalizeListToOptions(
          getUserList(user, "mobility_preferences", "mobility_constraints"),
          mobilityOptions,
        ),
  );
  const [mobilityOther, setMobilityOther] = useState(
    preferences.mobility_other || "",
  );
  const { data: messageListData, isFetching: isFetchingMessages } =
    useTripAgentMessageListQuery(
      tripId ? { trip_id: tripId, step: 2, page_size: 50 } : skipToken,
    );
  const serverMessages = unwrapAgentMessages(messageListData);
  const [agentMessages, setAgentMessages] = useState([]);
  const conversationMessages = [
    ...(serverMessages.length ? serverMessages : getInitialAgentMessages(trip)),
    ...agentMessages,
  ];
  const [agentFailureMessage, setAgentFailureMessage] = useState(
    trip?.agent_active === false ? trip?.agent_active_failed_message || "" : "",
  );
  const [isAgentActive, setIsAgentActive] = useState(
    trip?.agent_active === true,
  );
  const [isStepComplete, setIsStepComplete] = useState(
    Number(trip?.current_step) > 2,
  );
  const [message, setMessage] = useState("");
  const [activateAgent, { isLoading: isActivatingAgent }] =
    useTripAgentActiveMutation();
  const [createAgentMessage, { isLoading: isSendingMessage }] =
    useTripAgentCreateMessageMutation();

  const toggleListValue = (list, value) =>
    list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];

  const buildPayload = ({ letAgentDecide = false } = {}) => {
    const payload = {
      trip_id: tripId,
      current_step: 2,
      let_agent_decide: letAgentDecide,
    };

    if (letAgentDecide) return payload;

    return {
      ...payload,
      travel_pace: travelPace,
      interest_tags: interests,
      dietary_needs: dietaryNeeds,
      dietary_other: dietaryNeeds.includes("Other") ? dietaryOther : "",
      mobility_constraints: mobilityConstraints,
      mobility_other: mobilityConstraints.includes("Other")
        ? mobilityOther
        : "",
    };
  };

  const handleAgentResponse = (response) => {
    const data = unwrapAgentResponse(response);

    if (data.agent_active === false) {
      setIsAgentActive(false);
      setAgentFailureMessage(
        data.agent_active_failed_message || "The agent could not start.",
      );
      return;
    }

    setAgentFailureMessage("");
    setIsAgentActive(data.agent_active !== false);

    if (data.agent_message) {
      setAgentMessages((current) => [
        ...current,
        { role: "agent", content: data.agent_message },
      ]);
    }

    if (data.is_step_complete || Number(data.current_step) > 2) {
      setIsStepComplete(true);
      onStepComplete?.();
    }
  };

  const handleActivateAgent = async ({ letAgentDecide = false } = {}) => {
    if (!tripId) {
      toast.error("Trip id is missing.");
      return;
    }

    if (!letAgentDecide && !travelPace) {
      toast.error("Choose a travel pace or let the agent decide.");
      return;
    }

    try {
      const response = await activateAgent(
        buildPayload({ letAgentDecide }),
      ).unwrap();
      handleAgentResponse(response);
    } catch (error) {
      toast.error(error?.data?.message || "Could not activate the agent.");
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const userMessage = { role: "user", content: trimmedMessage };
    setAgentMessages((current) => [...current, userMessage]);
    setMessage("");

    try {
      const response = await createAgentMessage({
        trip_id: tripId,
        current_step: 2,
        message: trimmedMessage,
      }).unwrap();
      handleAgentResponse(response);
    } catch (error) {
      toast.error(error?.data?.message || "Could not send message.");
    }
  };

  return (
    <div className="flex min-h-full flex-col gap-4">
      <div className="flex gap-3 max-w-[88%]">
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Bot size={16} className="text-primary" />
        </div>
        <p className="bg-primary/10 text-sm leading-6 text-slate-700 rounded-xl px-3 py-2">
          Great. I have your basic trip details. Now I’ll understand what kind
          of trip experience you want so I can recommend the right places, food,
          activities, and pace.
        </p>
      </div>

      <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-4">
        <OptionGroup title="Travel Pace">
          <div className="grid gap-2">
            {travelPaceOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTravelPace(option.value)}
                className={`rounded-xl border p-3 text-left transition ${
                  travelPace === option.value
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
            {interestOptions.map((option) => (
              <ToggleOption
                key={option}
                selected={interests.includes(option)}
                onClick={() =>
                  setInterests((current) => toggleListValue(current, option))
                }
              >
                {option}
              </ToggleOption>
            ))}
          </div>
        </OptionGroup>

        <OptionGroup title="Dietary Needs">
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map((option) => (
              <ToggleOption
                key={option}
                selected={dietaryNeeds.includes(option)}
                onClick={() =>
                  setDietaryNeeds((current) => toggleListValue(current, option))
                }
              >
                {option}
              </ToggleOption>
            ))}
          </div>
          {dietaryNeeds.includes("Other") && (
            <FloatingInput
              name="dietary-other"
              label="Other dietary need"
              value={dietaryOther}
              onChange={(event) => setDietaryOther(event.target.value)}
            />
          )}
        </OptionGroup>

        <OptionGroup title="Mobility Constraints">
          <div className="flex flex-wrap gap-2">
            {mobilityOptions.map((option) => (
              <ToggleOption
                key={option}
                selected={mobilityConstraints.includes(option)}
                onClick={() =>
                  setMobilityConstraints((current) =>
                    toggleListValue(current, option),
                  )
                }
              >
                {option}
              </ToggleOption>
            ))}
          </div>
          {mobilityConstraints.includes("Other") && (
            <FloatingInput
              name="mobility-other"
              label="Other mobility constraint"
              value={mobilityOther}
              onChange={(event) => setMobilityOther(event.target.value)}
            />
          )}
        </OptionGroup>

        {agentFailureMessage && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
            {agentFailureMessage}
          </div>
        )}
      </div>
      {isAgentActive && (
        <div className="space-y-3 pb-2">
          {isFetchingMessages && !conversationMessages.length && (
            <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
              <Loader2 className="animate-spin text-primary" size={16} />
              Loading conversation...
            </div>
          )}

          {conversationMessages.map((item, index) => {
            const isUser = item.role === "user";

            return (
              <div
                key={item.id || `${item.role}-${index}`}
                className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-[88%] items-start gap-2 ${
                    isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {!isUser && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot size={16} className="text-primary" />
                    </div>
                  )}

                  <div
                    className={`w-fit rounded-2xl px-3 py-2.5 text-sm leading-6 ${
                      isUser
                        ? "rounded-br-md bg-primary text-white"
                        : "rounded-bl-md bg-primary/10 text-slate-700"
                    }`}
                  >
                    {item.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!isAgentActive ? (
        <div className="sticky translate-y-4 bottom-0 z-10 -mx-4 grid grid-cols-2 gap-3 border-t border-slate-200 bg-white p-4 shadow-[0_-10px_24px_rgba(15,23,42,0.08)]">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleActivateAgent({ letAgentDecide: true })}
            disabled={isActivatingAgent || isStepComplete}
          >
            {isActivatingAgent ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <Sparkles size={17} />
            )}
            Let agent decide
          </Button>
          <Button
            type="button"
            onClick={() => handleActivateAgent()}
            disabled={isActivatingAgent || isStepComplete}
          >
            {isActivatingAgent ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <Send size={17} />
            )}
            Proceed
          </Button>
        </div>
      ) : (
        <>
          {!isStepComplete && (
            <form
              onSubmit={handleSendMessage}
              className="sticky translate-y-4 bottom-0 z-10 -mx-4 flex gap-2 border-t border-slate-200 bg-white p-4 shadow-[0_-10px_24px_rgba(15,23,42,0.08)]"
            >
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Reply to the trip agent..."
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
        </>
      )}
    </div>
  );
};

export default UserProfileStep;
