import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"

import ProfileModal from "@/components/ProfileModal"
import { SettingsIcon, UserIcon,UsbIcon } from "lucide-react"
import { toast } from "sonner"

import {useSerialContext} from "@/context/serial-context"
import {useAuthContext} from "@/context/auth-context"
import { getUserInfo, type UserInfo } from "@/lib/supabase"

interface Language {
  value: string
  label: string
}

interface TopBarProps {
  userName?: string
}

const languages: Language[] = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
  { value: "pt", label: "Português" },
  { value: "fr", label: "Français" },
]


function ConnectionMachine(){
  const { t } = useTranslation()
  const {isConnected,connect,disconnect}=useSerialContext()
  return(
    <MenubarMenu>
      <MenubarTrigger className="flex items-center gap-2">
        <UsbIcon className="w-4 h-4" />
        {t('topBar.machine')}:<span className="inline-flex items-center gap-1"><span className={`rounded-full inline-block shrink-0 w-4 h-4  ${isConnected?"bg-green-600":"bg-red-600"}`}></span> {isConnected?t('topBar.connected'):t('topBar.disconnected')}</span>
      </MenubarTrigger>
      <MenubarContent>
         <MenubarItem onClick={isConnected?disconnect:connect}>
            {isConnected?t('topBar.disconnect'):t('topBar.connect')}
         </MenubarItem>  
      </MenubarContent>
    </MenubarMenu>
  )
}

function ProfileMenuItem({ userName }: { userName?: string }) {
  const { t } = useTranslation()
  const {closeSession} = useAuthContext()
  const [profileOpen, setProfileOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleShowProfile = async () => {
    setProfileOpen(true)
    setIsLoading(true)
    const info = await getUserInfo()
    setUserInfo(info)
    setIsLoading(false)
  }

  return (
    <>
      <MenubarMenu>
        <MenubarTrigger className="flex items-center gap-2 pr-2">
          <UserIcon className="w-4 h-4" />
          <span>{userName || t('topBar.profile')}</span>
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={handleShowProfile}>
            {t('topBar.showProfile')}
          </MenubarItem>
          <MenubarItem onClick={()=>toast.info(t('topBar.functionNotAvailable'),{position:"top-center"})}>
            {t('topBar.editProfile')}
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={closeSession}>
            {t('topBar.signOut')}
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <ProfileModal 
         open={profileOpen} 
         onChangeOpen={setProfileOpen} 
         userInfo={userInfo} 
         isLoading={isLoading}
      />
    </>
  )
}


function LanguageSubMenu() {
  const { t, i18n } = useTranslation()
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || "es")

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value)
    i18n.changeLanguage(value)
  }

  return (
    <MenubarMenu>
      <MenubarSub>
        <MenubarSubTrigger>
          {t('topBar.language')}
        </MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarRadioGroup 
            value={selectedLanguage} 
            onValueChange={handleLanguageChange}
          >
            {languages.map((lang) => (
              <MenubarRadioItem key={lang.value} value={lang.value}>
                {lang.label}
              </MenubarRadioItem>
            ))}
          </MenubarRadioGroup>
        </MenubarSubContent>
      </MenubarSub>
    </MenubarMenu>
  )
}

function SettingsMenuItem() {
  const { t } = useTranslation()
  const {selectPort,hasPort}=useSerialContext()
  return (
    <MenubarMenu>
      <MenubarTrigger className="flex items-center gap-2">
        <SettingsIcon className="w-4 h-4" />
        <span>{t('topBar.settings')}</span>
      </MenubarTrigger>
      <MenubarContent>
        {!hasPort && (
          <MenubarItem onClick={selectPort}>
           {t('topBar.selectPort')}
         </MenubarItem>
        )}
        {/* <MenubarItem>
          Preferencias
        </MenubarItem>
        <MenubarItem>
          Apariencia
        </MenubarItem> */}
        <MenubarSeparator />
        <LanguageSubMenu />
        <MenubarSeparator />
        <MenubarItem onClick={()=>toast.info(t('topBar.functionNotAvailable'),{position:"top-center"})}>
          {t('topBar.help')}
        </MenubarItem>
        <MenubarItem onClick={()=>toast.info(t('topBar.functionNotAvailable'),{position:"top-center"})}>
          {t('topBar.about')}
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  )
}

export function TopBar({ userName }: TopBarProps) {
   const {hasPort}=useSerialContext()



  return (
    <Menubar className="flex justify-end bg-sidebar  rounded-none h-10 pr-6">
      <ProfileMenuItem userName={userName} />
      <SettingsMenuItem />
      {hasPort && (
         <ConnectionMachine/>
      )}
      
    </Menubar>
  )
}
