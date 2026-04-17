const adjectives = [
	"Amber", "Bold", "Bright", "Cedar", "Clear", "Coral", "Dawn", "Deep",
	"Dense", "Dusk", "Ember", "Fair", "Firm", "Fleet", "Frost", "Gold",
	"Grand", "Grave", "Green", "Grove", "Hardy", "High", "Keen", "Lofty",
	"Maple", "Marsh", "Noble", "North", "Oaken", "Prime", "Quick", "Rapid",
	"Ridge", "Rocky", "Royal", "Sage", "Sharp", "Shore", "Silver", "Sleek",
	"South", "Stern", "Stone", "Storm", "Swift", "Thorn", "True", "Urban",
	"Vivid", "Wild",
];

const nouns = [
	"Arrow", "Axle", "Bark", "Beam", "Bear", "Birch", "Blaze", "Bolt",
	"Brace", "Brick", "Brook", "Buck", "Cairn", "Cedar", "Cleft", "Cliff",
	"Creek", "Crest", "Crane", "Croft", "Crow", "Dale", "Dart", "Dash",
	"Dune", "Eagle", "Elm", "Field", "Finch", "Flint", "Ford", "Fox",
	"Gale", "Gale", "Giant", "Glen", "Grove", "Guard", "Hawk", "Hill",
	"Hunt", "Iron", "Kite", "Lance", "Lark", "Ledge", "Lion", "Lodge",
	"Lynx", "Mast", "Mill", "Moor", "Moose", "Pack", "Peak", "Pine",
	"Raven", "Reed", "Ridge", "River", "Rock", "Rook", "Sage", "Scout",
	"Spire", "Stag", "Steel", "Stone", "Stork", "Swift", "Teal", "Trail",
	"Trek", "Vale", "Vane", "Vault", "Wren", "Wolf",
];

const symbols = ["#", "@", "!", "$", "%", "&", "*"];

function pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generates a readable yet strong password, e.g. "Maple#4729Wolf"
 * - Mixed case (Adjective + Noun)
 * - 4-digit number
 * - Symbol separator
 * - ~14 characters total
 */
export function generateReadablePassword(): string {
	const adj = pick(adjectives);
	const noun = pick(nouns);
	const num = Math.floor(1000 + Math.random() * 9000);
	const sym = pick(symbols);
	return `${adj}${sym}${num}${noun}`;
}
