// For swapping between tailwind css options
export default function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}