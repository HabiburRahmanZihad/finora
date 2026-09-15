// createTransactionSchema is a discriminated union wrapped in .superRefine(),
// which can't be used as a class base type (createZodDto needs a plain
// object shape). It's validated directly in the controller via
// `@UsePipes(new ZodValidationPipe(createTransactionSchema))` instead.
export type { CreateTransactionInput as CreateTransactionDto } from "@finora/validation";
