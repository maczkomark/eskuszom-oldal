// Az új (40%-os) Meta-hirdetések landolója (a régi /fb/ cím is ide visz).
// Statikus, az ár benne a vezérlőpultból jön — _kozos.js → statikusArakkal.
import { statikusArakkal } from "../_kozos.js";

export const onRequest = statikusArakkal;
