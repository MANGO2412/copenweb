import { useTranslation } from "react-i18next"
import { 
    type UserInfo
} from "@/lib/supabase"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button";

import {Badge} from "@/components/ui/badge"

interface ProfileModalProp{
    isLoading:boolean;
    userInfo:UserInfo|null;
    open:boolean;
    onChangeOpen:(open:boolean)=>void
}


export default function ProfileModal({userInfo,isLoading,open,onChangeOpen}:ProfileModalProp){
    const { t } = useTranslation()
    return(
      <Dialog open={open} onOpenChange={onChangeOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>{t('userProfile.title')}</DialogTitle>
            <DialogDescription>
              {t('userProfile.description')}
            </DialogDescription>
          </DialogHeader>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <span>{t('userProfile.loading')}</span>
            </div>
          ) : userInfo ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{t('userProfile.email')}</label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">{userInfo.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{t('userProfile.createdAt')}</label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">
                    {new Date(userInfo.createdAt).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{t('userProfile.role')}</label>
                <div className="p-3 bg-muted rounded-md">
                  <Badge variant="outline" className="text-sm">
                    {userInfo.role}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              {t('userProfile.noInfo')}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onChangeOpen(false)}>
              {t('userProfile.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
}