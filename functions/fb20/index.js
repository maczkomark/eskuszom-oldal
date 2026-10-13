// A régi, 20%-ot ígérő Meta-hirdetések landolója (a főoldalról ide küldjük).
// Statikus, az ár benne a vezérlőpultból jön — _kozos.js → statikusArakkal.
import { statikusArakkal } from "../_kozos.js";

export const onRequest = statikusArakkal;
