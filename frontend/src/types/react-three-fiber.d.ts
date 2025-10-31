/* eslint-disable @typescript-eslint/no-empty-object-type */
import { ReactThreeFiber } from "@react-three/fiber";

declare global {
  namespace JSX {
    interface IntrinsicElements extends ReactThreeFiber.IntrinsicElements {}
  }
}

export {};
