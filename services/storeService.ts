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
  chavePix: "41172968000182"
};

const storeConfigCacheKey = "pitsdog:store-config:v1";
let pendingStoreConfigRequest: Promise<StoreConfig> | null = null;

type StoreConfigCache = {
  expiresAt: number;
  value: StoreConfig;
};

const normalizeApiStatus = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_")
    .toUpperCase();

const isClosedForDelivery = (status: string) =>
  status === "FECHADA_PARA_ENTREGA" ||
  status === "FECHADO_PARA_ENTREGA" ||
  status === "FECHADA_ENTREGA" ||
  status === "FECHADO_ENTREGA" ||
  status === "FECHADA_TOTAL" ||
  status === "FECHADO_TOTAL" ||
  status === "FECHADA_TOTALMENTE" ||
  status === "FECHADO_TOTALMENTE";

const isClosedForPickup = (status: string) =>
  status === "FECHADA_PARA_RETIRADA" ||
  status === "FECHADO_PARA_RETIRADA" ||
  status === "FECHADA_RETIRADA" ||
  status === "FECHADO_RETIRADA" ||
  status === "FECHADA_TOTAL" ||
  status === "FECHADO_TOTAL" ||
  status === "FECHADA_TOTALMENTE" ||
  status === "FECHADO_TOTALMENTE";

const isClosedTotal = (status: string) =>
  status === "FECHADA" ||
  status === "FECHADO" ||
  status === "FECHADA_TOTAL" ||
  status === "FECHADO_TOTAL" ||
  status === "FECHADA_TOTALMENTE" ||
  status === "FECHADO_TOTALMENTE";

const clearStoreConfigCache = () => {
  try {
    window.sessionStorage.removeItem(storeConfigCacheKey);
  } catch {
    // Cache antigo nao deve prender loja aberta/fechada.
  }
};

const toMoneyValue = (value: unknown, fallback: number) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsedValue = Number(value.replace(",", "."));

    if (Number.isFinite(parsedValue)) return parsedValue;
  }

  return fallback;
};

export const getStoreConfig = async (): Promise<StoreConfig> => {
  if (!hasApiUrl) return fallbackStoreConfig;

  clearStoreConfigCache();

  if (pendingStoreConfigRequest) return pendingStoreConfigRequest;

  pendingStoreConfigRequest = apiRequest<Record<string, unknown>>("/loja/status")
    .then((apiStatus) => {
      const status = normalizeApiStatus(
        apiStatus.estadoOperacao ??
          apiStatus.status ??
          apiStatus.statusLoja ??
          ""
      );
      const lojaAberta =
        typeof apiStatus.aberta === "boolean"
          ? apiStatus.aberta
          : typeof apiStatus.lojaAberta === "boolean"
          ? apiStatus.lojaAberta
          : status
          ? status === "ABERTA" || !isClosedTotal(status)
          : fallbackStoreConfig.lojaAberta;

      const config: StoreConfig = {
        ...fallbackStoreConfig,
        lojaAberta,
        aceitaEntrega:
          typeof apiStatus.aceitaEntrega === "boolean"
            ? apiStatus.aceitaEntrega
            : isClosedForDelivery(status)
            ? false
            : fallbackStoreConfig.aceitaEntrega,
        aceitaRetirada:
          typeof apiStatus.aceitaRetirada === "boolean"
            ? apiStatus.aceitaRetirada
            : isClosedForPickup(status)
            ? false
            : fallbackStoreConfig.aceitaRetirada,
        aceitaMesa:
          typeof apiStatus.aceitaMesa === "boolean"
            ? apiStatus.aceitaMesa
            : isClosedTotal(status)
            ? false
            : fallbackStoreConfig.aceitaMesa,
        mensagemLojaFechada:
          typeof apiStatus.mensagem === "string"
            ? apiStatus.mensagem
            : fallbackStoreConfig.mensagemLojaFechada,
        taxaEntrega: toMoneyValue(
          apiStatus.taxaEntrega ?? apiStatus.deliveryFee ?? apiStatus.valorTaxaEntrega,
          fallbackStoreConfig.taxaEntrega
        ),
        chavePix:
          typeof apiStatus.chavePix === "string" && apiStatus.chavePix.trim()
            ? apiStatus.chavePix
            : fallbackStoreConfig.chavePix
      };

      return config;
    })
    .finally(() => {
      pendingStoreConfigRequest = null;
    });

  return pendingStoreConfigRequest;
};
