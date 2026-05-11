import { businessInfo } from "../data/business";
import { StoreConfig } from "../types/store";
import { apiRequest, hasApiUrl } from "./apiClient";

export const fallbackStoreConfig: StoreConfig = {
  id: "local",
  nomeLoja: businessInfo.name,
  lojaAberta: true,
  mensagemLojaFechada: "Estamos fechados no momento. Volte mais tarde para fazer seu pedido.",
  telefoneWhatsApp: businessInfo.phone.whatsapp,
  tempoEstimadoEntrega: "40-60 min",
  taxaEntrega: 5,
  pedidoMinimo: 0,
  aceitaRetirada: true,
  aceitaEntrega: true,
  aceitaMesa: true,
  aceitaDinheiro: true,
  aceitaPix: true,
  aceitaCartao: true,
  chavePix: ""
};

export const getStoreConfig = async (): Promise<StoreConfig> => {
  if (!hasApiUrl) return fallbackStoreConfig;

  try {
    return await apiRequest<StoreConfig>("/loja/config");
  } catch (error) {
    console.warn("Usando configuracao local da loja.", error);
    return fallbackStoreConfig;
  }
};
