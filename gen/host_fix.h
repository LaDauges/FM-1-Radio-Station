/* SPDX-License-Identifier: GPL-3.0-only
 * FM-1 Radio : inclus de force (emcc -include) avant le harnais de JIANT (tests/ui_test.c), sans modifier JIANT.
 *
 * Depuis V10.6, MUTATE est retiré du firmware (project.c n'a plus mutate_poll ni mut_sid), mais les tests MUTATE de
 * tests/ui_test.c les appellent encore. gcc les accepte en déclaration implicite (avertissement), clang (emcc) refuse.
 * Ces tests ne servent pas au générateur : des bouchons suffisent, jamais appelés par gen_go(). */
#ifndef FM1_RADIO_HOST_FIX_H
#define FM1_RADIO_HOST_FIX_H
#include <stdint.h>
static void mutate_poll(void) {}
static uint32_t mut_sid(uint32_t i, uint32_t eng) { (void)i; (void)eng; return 0xFFFFu; }   /* >= P_COUNT : aucun */
#endif
