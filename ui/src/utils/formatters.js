export const formatDate = (date) => {
	const dt = date instanceof Date ? date : new Date(date);

	return new Intl.DateTimeFormat("ru-RU", {
		day: "2-digit",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(dt);
};

/**
 * Возвращает true, если `number` входит в указанный диапазон
 * По умолчанию используется строгое сравнение
 * @param {number} number Число для проверки
 * @param {number} start Крайняя нижняя граница диапазона
 * @param {number} end Крайняя верхняя граница диапазона
 * @param {Object} config Конфигурация сравнения
 * @param { boolean } config.strictStartComparison Использовать строгое сравнение для нижней границы (>)
 * @param { boolean } config.strictEndComparison Использовать строгое сравнение для верхней границы (<)
 */
export function isIncludedInRange(
	number,
	start,
	end,
	{ strictStartComparison, strictEndComparison } = {
		strictStartComparison: true,
		strictEndComparison: true,
	}
) {
	return (
		(number < end && number > start) ||
		(!strictStartComparison && number === start) ||
		(!strictEndComparison && number === end)
	);
}

/**
 * Склоняет слово по количественному числительному `number`
 * @param {number} number Количественное числительное
 * @param {string} first Форма слова в именительном падеже и единственном числе
 * @param {string} second Форма слова в родительном падеже и единственном числе
 * @param {string} third Форма слова в родительном падеже и множественном числе
 */
export function declineWordByNumber(number, first, second, third) {
	const unsignedNumber = Math.abs(number);
	const numberTens = unsignedNumber % 100;
	const numberOnes = numberTens % 10;

	// Исключение из правила. Подходит third (р.п, мн. ч.)
	const isFrom11To19 = isIncludedInRange(numberTens, 10, 20);
	// Подходит second (р.п., ед.ч)
	const isFrom2To4 = isIncludedInRange(numberOnes, 1, 5);
	// Подходит first (и.п., ед.ч)
	const isEqualsOne = numberOnes === 1;

	return (
		(isFrom11To19 && third) ||
		(isFrom2To4 && second) ||
		(isEqualsOne && first) ||
		// Во всех остальных случаях третья форма
		third
	);
}
