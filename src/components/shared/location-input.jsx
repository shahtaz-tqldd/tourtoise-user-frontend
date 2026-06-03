import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import { LocateFixed, Loader2, MapPin } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

const getLocationAddress = async (latitude, longitude) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
  );

  if (!response.ok) {
    throw new Error("Reverse geocoding failed");
  }

  const location = await response.json();

  return (
    location?.display_name ||
    [
      location?.address?.road,
      location?.address?.suburb,
      location?.address?.city ||
        location?.address?.town ||
        location?.address?.village,
      location?.address?.country,
    ]
      .filter(Boolean)
      .join(", ")
  );
};

const LocationInput = ({
  label = "Start location",
  value,
  onChange,
  addressField = "address",
  latitudeField = "latitude",
  longitudeField = "longitude",
  accuracyField = "accuracy",
  placeholder = "Enter pickup or starting address",
  className,
}) => {
  const [mode, setMode] = useState("manual");
  const [isLocating, setIsLocating] = useState(false);

  const address = value?.[addressField] || "";

  const updateLocation = (nextLocation) => {
    onChange?.({
      ...value,
      ...nextLocation,
    });
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Current location is not available in this browser.");
      return;
    }

    setMode("current");
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        try {
          const resolvedAddress = await getLocationAddress(latitude, longitude);

          updateLocation({
            [addressField]: resolvedAddress,
            [latitudeField]: String(latitude),
            [longitudeField]: String(longitude),
            [accuracyField]: accuracy ? String(Math.round(accuracy)) : "",
          });
        } catch {
          updateLocation({
            [addressField]: address,
            [latitudeField]: String(latitude),
            [longitudeField]: String(longitude),
            [accuracyField]: accuracy ? String(Math.round(accuracy)) : "",
          });
          toast.error("Location found, but the address could not be resolved.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        toast.error(
          error?.code === error?.PERMISSION_DENIED
            ? "Location permission was denied."
            : "Could not read current location.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  };

  const useManualInput = () => {
    setMode("manual");
    updateLocation({
      [latitudeField]: "",
      [longitudeField]: "",
      [accuracyField]: "",
    });
  };

  return (
    <div className={className}>
      <div className="mb-3 flex gap-2">
        <Button
          type="button"
          variant={mode === "current" ? "default" : "outline"}
          size="sm"
          onClick={useCurrentLocation}
          disabled={isLocating}
          className="flex-1"
        >
          {isLocating ? (
            <Loader2 className="animate-spin" size={15} />
          ) : (
            <LocateFixed size={15} />
          )}
          Use current
        </Button>
        <Button
          type="button"
          variant={mode === "manual" ? "default" : "outline"}
          size="sm"
          onClick={useManualInput}
          className="flex-1"
        >
          <MapPin size={15} />
          Manual input
        </Button>
      </div>

      <FloatingInput
        name="start-location"
        label={label}
        placeholder={placeholder}
        value={address}
        onChange={(event) =>
          updateLocation({ [addressField]: event.target.value })
        }
      />
    </div>
  );
};

export default LocationInput;
