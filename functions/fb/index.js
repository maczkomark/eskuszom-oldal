// A Meta-hirdetések landolója statikus, de az ár benne a vezérlőpultból jön.
// Lásd: _kozos.js → statikusArakkal (a data-ar jelölésű helyek)
import { statikusArakkal } from "../_kozos.js";

export const onRequest = statikusArakkal;
