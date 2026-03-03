import { isAxiosError } from "axios";

export type StdErrResponse = {
  msg: string;
  stack?: string;
};
export const errorResponse = (error: unknown) => {
  let errorResponse: StdErrResponse;
  if (error instanceof Error) {
    errorResponse = {
      msg: error.message,
      stack: error.stack,
    };
  } else if (isAxiosError(error)) {
    errorResponse = {
      msg: error.message,
      stack: error.stack,
    };
  } else {
    errorResponse = {
      msg: "Unexpected error occurred",
    };
  }
  return errorResponse;
};
