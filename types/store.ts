export interface StoreConfig {
  id: string;
  nomeLoja: string;
  lojaAberta: boolean;
  mensagemLojaFechada: string;
  telefoneWhatsApp: string;
  tempoEstimadoEntrega: string;
  taxaEntrega: number;
  pedidoMinimo: number;
  aceitaRetirada: boolean;
  aceitaEntrega: boolean;
  aceitaMesa: boolean;
  aceitaDinheiro: boolean;
  aceitaPix: boolean;
  aceitaCartao: boolean;
  chavePix?: string;
}
