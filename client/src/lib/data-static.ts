/**
 * Carrega client/src/lib/data/ em data-utils, para uso no Node (servidor e scripts).
 * Importe este arquivo antes de qualquer módulo que use data-utils.
 * Nunca importe no código do navegador: isso colocaria todos os dados no JavaScript do site.
 */
import { initData } from "./data-utils";
import { episodes, products, people, mentions, dataRevisedAt } from "./data";

initData({ episodes, products, people, mentions, dataRevisedAt });
