// A kérdések oldala statikus, de az emlékoldal ára benne a vezérlőpultból jön.
// Lásd: _kozos.js → statikusArakkal
import { statikusArakkal } from "../_kozos.js";

export const onRequest = statikusArakkal;
