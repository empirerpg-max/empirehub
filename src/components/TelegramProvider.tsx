import { 
  useLaunchParams, 
} from '@telegram-apps/sdk-react';
import { 
  miniApp, 
  themeParams, 
  viewport, 
  mountMiniApp, 
  mountThemeParams, 
  mountViewport,
  bindMiniAppCssVars, 
  bindThemeParamsCssVars, 
  bindViewportCssVars,
  mockTelegramEnv,
  parseInitDataQuery,
  isTMA
} from '@telegram-apps/sdk';
import { useEffect, type ReactNode } from 'react';

// Ativar Mock apenas se não estiver rodando dentro do Telegram
if (!isTMA()) {
  mockTelegramEnv({
    themeParams: {
      accentTextColor: '#6ab0f3',
      bgColor: '#ffffff',
      buttonColor: '#3390ec',
      buttonTextColor: '#ffffff',
      destructiveTextColor: '#ec3942',
      hintColor: '#707579',
      linkColor: '#3390ec',
      secondaryBgColor: '#f4f4f5',
      sectionBgColor: '#ffffff',
      sectionHeaderTextColor: '#6ab0f3',
      subtitleTextColor: '#707579',
      textColor: '#000000',
    },
    initData: parseInitDataQuery('query_id=AAHd_EQuAAAAAN38RC6H9v7P&user=%7B%22id%22%3A279058391%2C%22first_name%22%3A%22Telegram%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22tma_user%22%2C%22language_code%22%3A%22en%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1662771648&hash=c501b71e775f74c044673b51259929f626549f3da832773b05120a16082c8b09'),
    initDataRaw: 'query_id=AAHd_EQuAAAAAN38RC6H9v7P&user=%7B%22id%22%3A279058391%2C%22first_name%22%3A%22Telegram%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22tma_user%22%2C%22language_code%22%3A%22en%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1662771648&hash=c501b71e775f74c044673b51259929f626549f3da832773b05120a16082c8b09',
    launchParams: {
      tgWebAppThemeParams: {
        accent_text_color: '#6ab0f3',
        bg_color: '#ffffff',
        button_color: '#3390ec',
        button_text_color: '#ffffff',
        destructive_text_color: '#ec3942',
        hint_color: '#707579',
        link_color: '#3390ec',
        secondary_bg_color: '#f4f4f5',
        text_color: '#000000',
      },
      tgWebAppData: 'query_id=AAHd_EQuAAAAAN38RC6H9v7P&user=%7B%22id%22%3A279058391%2C%22first_name%22%3A%22Telegram%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22tma_user%22%2C%22language_code%22%3A%22en%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1662771648&hash=c501b71e775f74c044673b51259929f626549f3da832773b05120a16082c8b09',
      tgWebAppVersion: '7.0',
      tgWebAppPlatform: 'tdesktop',
    },
  });
}

function AppInitializer({ children }: { children: ReactNode }) {
  useEffect(() => {
    try {
      mountMiniApp();
      mountThemeParams();
      mountViewport();
      
      bindMiniAppCssVars(miniApp, themeParams);
      bindThemeParamsCssVars(themeParams);
      viewport.mountPromise.then(() => {
        bindViewportCssVars(viewport);
      }).catch(console.error);
    } catch (e) {
      console.error('Falha ao inicializar SDK do Telegram:', e);
    }
  }, []);

  return <>{children}</>;
}

export function TelegramProvider({ children }: { children: ReactNode }) {
  return (
    <AppInitializer>
      {children}
    </AppInitializer>
  );
}
