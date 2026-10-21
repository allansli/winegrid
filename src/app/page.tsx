import { WineGridGame } from "@/components/WineGridGame";
import { I18nProvider } from "@/i18n/I18nProvider";

export default function HomePage() {
  return (
    <I18nProvider>
      <WineGridGame />
    </I18nProvider>
  );
}
