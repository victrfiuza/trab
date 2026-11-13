// Códigos de horário: 1º dígito = dia da semana, 2º dígito = turno.
// Ex.: "21" = segunda-feira de manhã, "33" = terça-feira à noite.

export const DIAS = {
  2: 'Segunda',
  3: 'Terça',
  4: 'Quarta',
  5: 'Quinta',
  6: 'Sexta',
  7: 'Sábado',
};

export const TURNOS = {
  1: 'Manhã',
  2: 'Tarde',
  3: 'Noite',
};

// Lista com todos os códigos válidos: ["21", "22", "23", "31", ...]
export const HORARIOS = Object.keys(DIAS).flatMap((dia) =>
  Object.keys(TURNOS).map((turno) => dia + turno)
);

// "33" -> "Terça - Noite"
export function descreverHorario(codigo) {
  const dia = DIAS[codigo[0]];
  const turno = TURNOS[codigo[1]];
  return dia && turno ? `${dia} - ${turno}` : 'Horário inválido';
}
