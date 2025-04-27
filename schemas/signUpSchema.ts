import * as z from "zod";

export const signUpSchema = z
.object({
  email: z
      .string()
      .min(1, {message: "Email is req"})
      .email({message: "pls enter valid email"}),
  password: z
        .string()
        .min(1, {message: "pass is req"})
        .min(8, {message: "pass shoould be min of 8 char"}),
  passwordConfirmation: z
        .string()
        .min(1, {message: "pls confirm your pass"})
})
.refine((data) => data.password === data.passwordConfirmation, {
  message: "password is not matching",
  path: ["passwordConfirmation"],
})