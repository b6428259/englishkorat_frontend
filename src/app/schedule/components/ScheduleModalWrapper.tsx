"use client";

import {
  Course,
  CreateScheduleInput as CreateScheduleRequest,
  Room,
  TeacherOption,
} from "@/services/api/schedules";
import { useCallback, useState } from "react";
import ClassScheduleModal from "./ClassScheduleModal";
import EventScheduleModal from "./EventScheduleModal";
import EventTypeSelectionModal from "./EventTypeSelectionModal";
import ScheduleTypeSelectionModal from "./ScheduleTypeSelectionModal";

interface ScheduleModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (form: Partial<CreateScheduleRequest>) => Promise<void>;
  courses: Course[];
  rooms: Room[];
  teachers: TeacherOption[];
  isLoading?: boolean;
  error?: string | null;
}

type ModalStep = "type-selection" | "event-type-selection" | "form";
type ScheduleType =
  | "class"
  | "meeting"
  | "appointment"
  | "event"
  | "personal"
  | "holiday";

export default function ScheduleModalWrapper({
  isOpen,
  onClose,
  onConfirm,
  courses,
  rooms,
  teachers,
  isLoading = false,
  error,
}: ScheduleModalWrapperProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>("type-selection");
  const [selectedScheduleType, setSelectedScheduleType] =
    useState<ScheduleType>("class");

  // Reset state when modal closes
  const handleClose = useCallback(() => {
    setCurrentStep("type-selection");
    setSelectedScheduleType("class");
    onClose();
  }, [onClose]);

  // Handle selecting "Class" from type selection
  const handleSelectClass = useCallback(() => {
    setSelectedScheduleType("class");
    setCurrentStep("form");
  }, []);

  // Handle selecting "Events" from type selection
  const handleSelectEvents = useCallback(() => {
    setCurrentStep("event-type-selection");
  }, []);

  // Handle selecting specific event type
  const handleSelectEventType = useCallback((eventType: ScheduleType) => {
    setSelectedScheduleType(eventType);
    setCurrentStep("form");
  }, []);

  // Handle back button from event type selection to type selection
  const handleBackToTypeSelection = useCallback(() => {
    setCurrentStep("type-selection");
  }, []);

  // Handle back button from form to appropriate previous step
  const handleBackFromForm = useCallback(() => {
    if (selectedScheduleType === "class") {
      setCurrentStep("type-selection");
    } else {
      setCurrentStep("event-type-selection");
    }
  }, [selectedScheduleType]);

  // Handle confirm from form
  const handleConfirm = useCallback(
    async (form: Partial<CreateScheduleRequest>) => {
      await onConfirm(form);
      // After successful confirmation, reset and close
      handleClose();
    },
    [onConfirm, handleClose]
  );

  return (
    <>
      {/* Step 1: Type Selection (Class or Events) */}
      <ScheduleTypeSelectionModal
        isOpen={isOpen && currentStep === "type-selection"}
        onClose={handleClose}
        onSelectClass={handleSelectClass}
        onSelectEvents={handleSelectEvents}
      />

      {/* Step 2: Event Type Selection (if Events was selected) */}
      <EventTypeSelectionModal
        isOpen={isOpen && currentStep === "event-type-selection"}
        onClose={handleClose}
        onBack={handleBackToTypeSelection}
        onSelectEventType={handleSelectEventType}
      />

      {/* Step 3a: Class Schedule Modal (if Class was selected) */}
      <ClassScheduleModal
        isOpen={
          isOpen && currentStep === "form" && selectedScheduleType === "class"
        }
        onClose={handleClose}
        onBack={handleBackFromForm}
        onConfirm={handleConfirm}
        courses={courses}
        rooms={rooms}
        teachers={teachers}
        isLoading={isLoading}
        error={error}
      />

      {/* Step 3b: Event Schedule Modal (if Event was selected) */}
      {selectedScheduleType !== "class" && (
        <EventScheduleModal
          isOpen={isOpen && currentStep === "form"}
          onClose={handleClose}
          onBack={handleBackFromForm}
          onConfirm={handleConfirm}
          eventType={
            selectedScheduleType as
              | "meeting"
              | "appointment"
              | "event"
              | "personal"
              | "holiday"
          }
          rooms={rooms}
          teachers={teachers}
          isLoading={isLoading}
          error={error}
        />
      )}
    </>
  );
}
