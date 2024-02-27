import { SelfData } from "./types";
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from "./contants";

const LOCAL_VAR = "chat_profile";

export const loadProfile = (): SelfData | undefined => {
  const profile = localStorage.getItem(LOCAL_VAR);

  if (profile)
    try {
      const parsed = JSON.parse(profile);
      if (
        !parsed.name ||
        parsed.name.length < NAME_MIN_LENGTH ||
        parsed.name.length > NAME_MAX_LENGTH ||
        !parsed.conId ||
        !parsed.salt
      ) {
        clearProfile();
        return undefined;
      }
      return parsed;
    } catch (e) {
      clearProfile();
      return undefined;
    }

  return undefined;
};

export const saveProfile = (selfData: SelfData) => {
  const p = JSON.stringify(selfData);
  console.log("saving profile", p);
  localStorage.setItem(LOCAL_VAR, p);
};

export const clearProfile = () => {
  localStorage.removeItem(LOCAL_VAR);
};
