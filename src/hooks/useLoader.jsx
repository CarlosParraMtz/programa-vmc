import { useSetAtom } from "jotai";
import { loader } from "../jotai/atoms";

export default function useLoader() {
  const setLoaderState = useSetAtom(loader);

  const setLoader = (isLoading) => {
    setLoaderState(Boolean(isLoading));
  };

  return { setLoader };
}
