import { CheckCircle2, Circle } from "lucide-react";
import { useEffect, useRef } from "react";
import { canOpenStep, isStepComplete } from "../planning-step-utils";

const PlanningStepRail = ({
  steps,
  activeStep,
  unlockedStep,
  trip,
  planningState,
  onStepSelect,
}) => {
  const railRef = useRef(null);
  const buttonRefs = useRef({});

  useEffect(() => {
    const rail = railRef.current;
    const activeButton = buttonRefs.current[activeStep];
    if (!rail || !activeButton) return;

    rail.scrollTo({
      left:
        activeButton.offsetLeft -
        rail.clientWidth / 2 +
        activeButton.clientWidth / 2,
      behavior: "smooth",
    });
  }, [activeStep]);

  return (
    <div className="border-b border-slate-200 px-4 py-3">
      <div
        ref={railRef}
        className="flex overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {steps.map((step, index) => {
          const isAvailable = planningState?.flow?.length
            ? canOpenStep({ trip, payload: planningState, stepKey: step.key })
            : index <= unlockedStep;
          const isActive = index === activeStep;
          const isComplete = isStepComplete({
            trip,
            payload: planningState,
            stepKey: step.key,
          });
          const StepIcon = isComplete ? CheckCircle2 : Circle;

          return (
            <button
              ref={(node) => {
                buttonRefs.current[index] = node;
              }}
              key={step.key}
              type="button"
              onClick={() => onStepSelect(index)}
              disabled={!isAvailable}
              className={`flx shrink-0 gap-1 whitespace-nowrap rounded-md py-1.5 pl-2.5 pr-3 text-center transition ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : isComplete
                    ? "text-slate-700 hover:bg-slate-100"
                    : "text-slate-400"
              } ${!isAvailable ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <StepIcon
                aria-hidden="true"
                className={`shrink-0 ${
                  isComplete ? "fill-primary/10" : "fill-current"
                }`}
                size={14}
              />
              <span className="text-[11px] font-medium leading-4">
                {step.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PlanningStepRail;
