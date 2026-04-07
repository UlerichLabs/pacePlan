export const ERROR_CODES = {
  MACROCYCLE: {
    NAME_EMPTY: "400.010",
    NAME_LENGTH: "400.011",
    INVALID_DATES: "400.012",
    INVALID_DISTANCE: "400.013",
    ALREADY_ACTIVE: "409.010",
    CREATED: "201.001",
  },
} as const;

export const ERROR_MESSAGES = {
  MACROCYCLE: {
    NAME_EMPTY: "Dê um nome ao seu projeto de treino",
    NAME_LENGTH: "O nome deve ter entre 3 e 100 caracteres",
    INVALID_DATES: "A data de início deve ser anterior à data da prova",
    INVALID_DISTANCE: "A distância alvo deve ser maior que zero",
    ALREADY_ACTIVE: "Você já possui um macrociclo ativo. Conclua ou arquive o atual antes de iniciar um novo.",
    CREATED: "Projeto '{name}' criado com sucesso!",
  },
} as const;

export class DomainError extends Error {
  public code: string;
  public statusCode: number;

  constructor(message: string, code: string, statusCode: number = 400) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

