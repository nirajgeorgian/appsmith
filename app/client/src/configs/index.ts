import { AppsmithUIConfigs, FeatureFlagConfig } from "./types";
import { Integrations } from "@sentry/tracing";
import * as Sentry from "@sentry/react";
import { createBrowserHistory } from "history";
const history = createBrowserHistory();

type INJECTED_CONFIGS = {
  sentry: {
    dsn: string;
    release: string;
    environment: string;
  };
  smartLook: {
    id: string;
  };
  enableGoogleOAuth: boolean;
  enableGithubOAuth: boolean;
  enableRapidAPI: boolean;
  segment: string;
  optimizely: string;
  enableMixpanel: boolean;
  google: string;
  enableTNCPP: boolean;
  cloudHosting: boolean;
  algolia: {
    apiId: string;
    apiKey: string;
    indexName: string;
  };
  logLevel: "debug" | "error";
  appVersion: {
    id: string;
    releaseDate: string;
  };
  intercomAppID: string;
  mailEnabled: boolean;
};
declare global {
  interface Window {
    APPSMITH_FEATURE_CONFIGS: INJECTED_CONFIGS;
    Intercom: any;
  }
}

const capitalizeText = (text: string) => {
  const rest = text.slice(1);
  const first = text[0].toUpperCase();
  return `${first}${rest}`;
};

const getConfigsFromEnvVars = (): INJECTED_CONFIGS => {
  return {
    sentry: {
      dsn: process.env.REACT_APP_SENTRY_DSN || "",
      release: process.env.REACT_APP_SENTRY_RELEASE || "",
      environment:
        process.env.REACT_APP_SENTRY_ENVIRONMENT ||
        capitalizeText(process.env.NODE_ENV),
    },
    smartLook: {
      id: process.env.REACT_APP_SMART_LOOK_ID || "",
    },
    enableGoogleOAuth: process.env.REACT_APP_OAUTH2_GOOGLE_CLIENT_ID
      ? process.env.REACT_APP_OAUTH2_GOOGLE_CLIENT_ID.length > 0
      : false,
    enableGithubOAuth: process.env.REACT_APP_OAUTH2_GITHUB_CLIENT_ID
      ? process.env.REACT_APP_OAUTH2_GITHUB_CLIENT_ID.length > 0
      : false,
    segment: process.env.REACT_APP_SEGMENT_KEY || "",
    optimizely: process.env.REACT_APP_OPTIMIZELY_KEY || "",
    enableMixpanel: process.env.REACT_APP_SEGMENT_KEY
      ? process.env.REACT_APP_SEGMENT_KEY.length > 0
      : false,
    algolia: {
      apiId: process.env.REACT_APP_ALGOLIA_API_ID || "",
      apiKey: process.env.REACT_APP_ALGOLIA_API_KEY || "",
      indexName: process.env.REACT_APP_ALGOLIA_SEARCH_INDEX_NAME || "",
    },
    logLevel:
      (process.env.REACT_APP_CLIENT_LOG_LEVEL as
        | "debug"
        | "error"
        | undefined) || "debug",
    google: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    enableTNCPP: process.env.REACT_APP_TNC_PP
      ? process.env.REACT_APP_TNC_PP.length > 0
      : false,
    enableRapidAPI: process.env.REACT_APP_MARKETPLACE_URL
      ? process.env.REACT_APP_MARKETPLACE_URL.length > 0
      : false,
    cloudHosting: process.env.REACT_APP_CLOUD_HOSTING
      ? process.env.REACT_APP_CLOUD_HOSTING.length > 0
      : false,
    appVersion: {
      id: process.env.REACT_APP_VERSION_ID || "",
      releaseDate: process.env.REACT_APP_VERSION_RELEASE_DATE || "",
    },
    intercomAppID: process.env.REACT_APP_INTERCOM_APP_ID || "",
    mailEnabled: process.env.REACT_APP_MAIL_ENABLED
      ? process.env.REACT_APP_MAIL_ENABLED.length > 0
      : false,
  };
};

const getConfig = (fromENV: string, fromWindow: string) => {
  if (fromENV.length > 0) return { enabled: true, value: fromENV };
  else if (fromWindow.length > 0) return { enabled: true, value: fromWindow };
  return { enabled: false, value: "" };
};

// TODO(Abhinav): See if this is called so many times, that we may need some form of memoization.
export const getAppsmithConfigs = (): AppsmithUIConfigs => {
  const { APPSMITH_FEATURE_CONFIGS } = window;
  const ENV_CONFIG = getConfigsFromEnvVars();
  const getFeatureFlags = (
    optimizelyApiKey: string,
  ): FeatureFlagConfig | undefined => {
    if (optimizelyApiKey.length > 0) {
      return {
        remoteConfig: {
          optimizely: optimizelyApiKey,
        },
        default: {},
      };
    }
    return;
  };

  // const sentry = getConfig(ENV_CONFIG.sentry, APPSMITH_FEATURE_CONFIGS.sentry);
  const sentryDSN = getConfig(
    ENV_CONFIG.sentry.dsn,
    APPSMITH_FEATURE_CONFIGS.sentry.dsn,
  );
  const sentryRelease = getConfig(
    ENV_CONFIG.sentry.release,
    APPSMITH_FEATURE_CONFIGS.sentry.release,
  );
  const sentryENV = getConfig(
    APPSMITH_FEATURE_CONFIGS.sentry.environment,
    ENV_CONFIG.sentry.environment,
  );
  const segment = getConfig(
    ENV_CONFIG.segment,
    APPSMITH_FEATURE_CONFIGS.segment,
  );
  const google = getConfig(ENV_CONFIG.google, APPSMITH_FEATURE_CONFIGS.google);

  // As the following shows, the config variables can be set using a combination
  // of env variables and injected configs
  const smartLook = getConfig(
    ENV_CONFIG.smartLook.id,
    APPSMITH_FEATURE_CONFIGS.smartLook.id,
  );

  const algoliaAPIID = getConfig(
    ENV_CONFIG.algolia.apiId,
    APPSMITH_FEATURE_CONFIGS.algolia.apiKey,
  );
  const algoliaAPIKey = getConfig(
    ENV_CONFIG.algolia.apiKey,
    APPSMITH_FEATURE_CONFIGS.algolia.apiKey,
  );
  const algoliaIndex = getConfig(
    ENV_CONFIG.algolia.indexName,
    APPSMITH_FEATURE_CONFIGS.algolia.indexName,
  );

  return {
    sentry: {
      enabled: sentryDSN.enabled && sentryRelease.enabled && sentryENV.enabled,
      dsn: sentryDSN.value,
      release: sentryRelease.value,
      environment: sentryENV.value,
      integrations: [
        new Integrations.BrowserTracing({
          // Can also use reactRouterV4Instrumentation
          routingInstrumentation: Sentry.reactRouterV5Instrumentation(history),
        }),
      ],
      tracesSampleRate: 1.0,
    },
    smartLook: {
      enabled: smartLook.enabled,
      id: smartLook.value,
    },
    segment: {
      enabled: segment.enabled,
      apiKey: segment.value,
    },
    algolia: {
      enabled: true,
      apiId: algoliaAPIID.value || "AZ2Z9CJSJ0",
      apiKey: algoliaAPIKey.value || "d113611dccb80ac14aaa72a6e3ac6d10",
      indexName: algoliaIndex.value || "test_appsmith",
    },
    google: {
      enabled: google.enabled,
      apiKey: google.value,
    },
    enableRapidAPI:
      ENV_CONFIG.enableRapidAPI || APPSMITH_FEATURE_CONFIGS.enableRapidAPI,
    enableGithubOAuth:
      ENV_CONFIG.enableGithubOAuth ||
      APPSMITH_FEATURE_CONFIGS.enableGithubOAuth,
    enableGoogleOAuth:
      ENV_CONFIG.enableGoogleOAuth ||
      APPSMITH_FEATURE_CONFIGS.enableGoogleOAuth,
    enableMixpanel:
      ENV_CONFIG.enableMixpanel || APPSMITH_FEATURE_CONFIGS.enableMixpanel,
    cloudHosting:
      ENV_CONFIG.cloudHosting || APPSMITH_FEATURE_CONFIGS.cloudHosting,
    featureFlag: getFeatureFlags(
      ENV_CONFIG.optimizely || APPSMITH_FEATURE_CONFIGS.optimizely,
    ),
    logLevel: ENV_CONFIG.logLevel || APPSMITH_FEATURE_CONFIGS.logLevel,
    enableTNCPP: ENV_CONFIG.enableTNCPP || APPSMITH_FEATURE_CONFIGS.enableTNCPP,
    appVersion: ENV_CONFIG.appVersion || APPSMITH_FEATURE_CONFIGS.appVersion,
    intercomAppID:
      ENV_CONFIG.intercomAppID || APPSMITH_FEATURE_CONFIGS.intercomAppID,
    mailEnabled: ENV_CONFIG.mailEnabled || APPSMITH_FEATURE_CONFIGS.mailEnabled,
  };
};
