// A főoldal statikus, de az ár benne a vezérlőpultból jön.
// Lásd: _kozos.js → statikusArakkal
import { statikusArakkal } from "./_kozos.js";

export const onRequest = statikusArakkal;
