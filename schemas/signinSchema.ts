import * as z from "zod"

export const signInSchema =z.object({
  identifier: z
        .string()
        .min(1,{message: "email is req"})
        .email({message: "please enter the email"}),
  password: z
      .string()
      .min(1, {message: "enter your password"})
      .min(8, {message: "password must atleast 8 chars"}),
})