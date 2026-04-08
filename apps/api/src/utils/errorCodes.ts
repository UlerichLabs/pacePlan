export const ERROR_CODES = {
  MACROCYCLE: {
    NAME_EMPTY: "400.010",
    NAME_LENGTH: "400.011",
    INVALID_DATES: "400.012",
    INVALID_DISTANCE: "400.013",
    ALREADY_ACTIVE: "409.010",
    NOT_FOUND: "404.010",
    CREATED: "201.001",
    ARCHIVED: "200.010",
  },
  PHASE: {
    INVALID_NAME_OBJECTIVE: "400.020",
    OUT_OF_BOUNDS: "400.021",
    OVERLAP: "409.020",
    NOT_FOUND: "404.020",
    CREATED: "201.002",
    UPDATED: "200.020",
  },
} as const;

export const ERROR_MESSAGES = {
  MACROCYCLE: {
    NAME_EMPTY: "Dê um nome ao seu projeto de treino",
    NAME_LENGTH: "O nome deve ter entre 3 e 100 caracteres",
    INVALID_DATES: "A data de início deve ser anterior à data da prova",
    INVALID_DISTANCE: "A distância alvo deve ser maior que zero",
    ALREADY_ACTIVE: "Você já possui um macrociclo ativo. Conclua ou arquive o atual antes de iniciar um novo.",
    NOT_FOUND: "Nenhum macrociclo ativo encontrado",
    CREATED: "Projeto '{name}' criado com sucesso!",
    ARCHIVED: "Projeto arquivado com sucesso",
  },
  PHASE: {
    INVALID_NAME_OBJECTIVE: "Defina um nome e um objetivo claro para esta fase",
    OUT_OF_BOUNDS: "O período da fase deve estar dentro das datas do macrociclo",
    OVERLAP: "As datas desta fase entram em conflito com uma fase já cadastrada neste macrociclo",
    NOT_FOUND: "Fase não encontrada neste macrociclo",
    CREATED: "Fase '{name}' adicionada ao seu planejamento.",
    UPDATED: "Fase '{name}' atualizada com sucesso.",
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
