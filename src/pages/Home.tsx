import { useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TopBar } from "@/components/TopBar"
import { PatientView } from "@/views/PatientView"
import { AnalysisView } from "@/views/AnalysisView"
import { RemediesView } from "@/views/RemediesView"
import { CategoriesView } from "@/views/CategoriesView"
import { BroadcastingView } from "@/views/BroadcastingView"



function Home() {
  const [activeOption, setActiveOption] = useState("patient")


  const renderContent = () => {
    switch (activeOption) {
      case "patient":
        return <PatientView />
      case "analysis":
        return <AnalysisView  />
      case "remedies":
        return <RemediesView />
      // case "chromotherapy":
      //   return <div className="p-6"><h2>Chromotherapy</h2></div>
      case "categories":
        return <CategoriesView />
      case "broadcasting":
        return <BroadcastingView />
      default:
        return <div className="p-6"><h2>Select an option</h2></div>
    }
  }

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen bg-background">
        <Sidebar activeOption={activeOption} onSelect={setActiveOption} />
        <div className="flex flex-col flex-1">
          <TopBar />
          <main className="w-full h-full p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default Home