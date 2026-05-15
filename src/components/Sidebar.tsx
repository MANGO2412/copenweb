import { useTranslation } from "react-i18next"
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"

//images and icons
import patientsIcon from "@/assets/patients-40x40.png"
import analysisIcon from "@/assets/analysis-22x22.png"
import RemediesIcon from "@/assets/Remedies-40x40.png"
// import ChromotherapyIcon from "@/assets/Chromotherapy-0240x40.png"
import CategoriesIcon from "@/assets/Categories-40x40.png"
import BroadcastingIcon from "@/assets/broadcasting-40x40.png"
import ImageCopenLabs from "@/assets/imageCopenLabs-removebg-preview.png"
import LogoCopenLabs from "@/assets/logocopen.png" 


const menuItems = [
  { id: "patient", labelKey: "sidebar.patient", icon: patientsIcon },
  { id: "analysis", labelKey: "sidebar.analysis", icon: analysisIcon },
  { id: "remedies", labelKey: "sidebar.remedies", icon: RemediesIcon },
  // { id: "chromotherapy", label: "Chromotherapy", icon: ChromotherapyIcon },
  { id: "categories", labelKey: "sidebar.categories", icon: CategoriesIcon },
  { id: "broadcasting", labelKey: "sidebar.broadcasting", icon: BroadcastingIcon },
]

interface SidebarProps {
  activeOption: string
  onSelect: (option: string) => void
}

export function Sidebar({ activeOption, onSelect }: SidebarProps) {
  const { t } = useTranslation()
  return (
    <ShadcnSidebar collapsible="none" className="w-64 border-2" >      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="sr-only">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeOption === item.id}
                    onClick={() => onSelect(item.id)}
                    className="cursor-pointer"
                  >
                    <button className="flex items-center gap-3 w-full h-15 p-5">
                      <img src={item.icon} alt={t(item.labelKey)} className="w-5 h-5" />
                      <span className="font-medium text-xl">{t(item.labelKey)}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="flex flex-col items-center gap-2 p-4">
          <img src={ImageCopenLabs} alt="Logo" className="w-45" />
          <img src={LogoCopenLabs} alt="Logo" className="w-45" />
      </SidebarFooter>
    </ShadcnSidebar>
  )
}

export function AppSidebar({ activeOption, onSelect }: SidebarProps) {
  

  return (
      <Sidebar activeOption={activeOption} onSelect={onSelect} />
  )
}
