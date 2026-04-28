import { 
  useLaunchParams, 
} from '@telegram-apps/sdk-react';
import { 
  init,
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
import { useEffect, useRef, type ReactNode } from 'react';

// Ativar Mock apenas se não estiver rodando dentro do Telegram
try {
  if (typeof isTMA === 'function' && !isTMA()) {
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
      initData: parseInitDataQuery('query_id=AAHd_EQuAAAAAN38RC6H9v7P&user=%7B%22id%22%3A279058391%2C%22first_name%22%3A%22Telegram%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22tma_user%22%2C%22language_code%22%3A%22en%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1662771648&hash=c501b71e775f74c044673b51259929f626549f3da832773b05120a16082c8b09&signature=63c193259850787e91266e792a6a162232937322ecd90d0c27bac4345e7d911'),
      initDataRaw: 'query_id=AAHd_EQuAAAAAN38RC6H9v7P&user=%7B%22id%22%3A279058391%2C%22first_name%22%3A%22Telegram%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22tma_user%22%2C%22language_code%22%3A%22en%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1662771648&hash=c501b71e775f74c044673b51259929f626549f3da832773b05120a16082c8b09&signature=63c193259850787e91266e792a6a162232937322ecd90d0c27bac4345e7d911',
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
        tgWebAppData: 'query_id=AAHd_EQuAAAAAN38RC6H9v7P&user=%7B%22id%22%3A279058391%2C%22first_name%22%3A%22Telegram%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22tma_user%22%2C%22language_code%22%3A%22en%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1662771648&hash=c501b71e775f74c044673b51259929f626549f3da832773b05120a16082c8b09&signature=63c193259850787e91266e792a6a162232937322ecd90d0c27bac4345e7d911',
        tgWebAppVersion: '7.0',
        tgWebAppPlatform: 'tdesktop',
      },
    });
  }
} catch (e) {
  console.warn('Error during mock initialization:', e);
}

function AppInitializer({ children }: { children: ReactNode }) {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    async function initialize() {
      try {
        console.log('[SDK] Starting initialization...');
        if (typeof init === 'function') {
          init();
        } else {
          console.warn('[SDK] init is not a function');
        }
        
        // Mount MiniApp
        try {
          if (typeof mountMiniApp === 'function') {
            await mountMiniApp();
            console.log('[SDK] MiniApp mounted');
          }
        } catch (e) {
          console.warn('[SDK] MiniApp mount failed or already mounted:', e);
        }

        // Mount ThemeParams
        try {
          if (typeof mountThemeParams === 'function') {
            await mountThemeParams();
            console.log('[SDK] ThemeParams mounted');
          }
        } catch (e) {
          console.warn('[SDK] ThemeParams mount failed or already mounted:', e);
        }

        // Bind CSS Vars
        try {
          if (typeof bindMiniAppCssVars === 'function') bindMiniAppCssVars(miniApp, themeParams);
          if (typeof bindThemeParamsCssVars === 'function') bindThemeParamsCssVars(themeParams);
          console.log('[SDK] CSS Vars bound');
        } catch (e) {
          console.warn('[SDK] CSS binding error:', e);
        }

        // Mount Viewport
        try {
          if (typeof mountViewport === 'function') {
            await mountViewport();
            console.log('[SDK] Viewport mounted');
            if (typeof bindViewportCssVars === 'function') {
               bindViewportCssVars(viewport);
               console.log('[SDK] Viewport CSS Vars bound');
            }
          }
        } catch (e) {
          console.warn('[SDK] Viewport mount failed:', e);
        }

        console.log('[SDK] Initialization complete');
      } catch (e: any) {
        console.error('Falha crítica ao inicializar SDK do Telegram:', e);
        // Em caso de erro "e is not a function", logar o stack trace e os tipos
        console.log('DEBUG SDK Types:', {
          init: typeof init,
          mountMiniApp: typeof mountMiniApp,
          miniApp: typeof miniApp,
          themeParams: typeof themeParams,
          viewport: typeof viewport,
        });
        isInitialized.current = false;
      }
    }

    initialize();
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
