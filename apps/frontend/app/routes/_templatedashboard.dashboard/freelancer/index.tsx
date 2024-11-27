import { sidebarEmployerNav } from "~/constants/navigation";
import { useTranslation } from "react-i18next";
import Sidebar from "~/routes/_templatedashboard/Sidebar";

export default function Dashboard() {
  const { t } = useTranslation();
  const menuNavigation = sidebarEmployerNav(t); //
  return (
    <div>
      <div className="flex">
        <h1 className="text-2xl font-bold m-10 mt-[100px]">hi</h1>
      </div>
    </div>
  );
}
