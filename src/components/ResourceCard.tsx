import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { ExternalLink, Play, BookOpen, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface Resource {
  id: string
  title: string
  description: string
  thumbnail: string
  url: string
  platform: 'youtube' | 'gfg' | 'general'
}

export function ResourceCard({ resource }: { resource: Resource }) {
  const getPlatformIcon = () => {
    switch (resource.platform) {
      case 'youtube': return <Play className="w-4 h-4 text-red-500" />
      case 'gfg': return <BookOpen className="w-4 h-4 text-green-500" />
      case 'general': return <Globe className="w-4 h-4 text-blue-500" />
    }
  }

  const getPlatformLabel = () => {
    switch (resource.platform) {
      case 'youtube': return 'YouTube'
      case 'gfg': return 'GeeksforGeeks'
      case 'general': return 'Web Article'
    }
  }

  const getCardClass = () => {
    switch (resource.platform) {
      case 'youtube': return 'card-youtube'
      case 'gfg': return 'card-gfg'
      case 'general': return 'card-web'
    }
  }

  return (
    <Card className={`glass overflow-hidden flex flex-col h-full transition-all hover:scale-[1.02] ${getCardClass()}`}>
      <div className="relative aspect-video w-full overflow-hidden">
        {resource.thumbnail ? (
          <img 
            src={resource.thumbnail} 
            alt={resource.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            {getPlatformIcon()}
          </div>
        )}
        <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
          {getPlatformIcon()}
          {getPlatformLabel()}
        </div>
      </div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base line-clamp-2 leading-tight">
          {resource.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <CardDescription className="text-xs line-clamp-3">
          {resource.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <a 
          href={resource.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full gap-2 group")}
        >
          {resource.platform === 'youtube' ? 'Watch' : 'Read'}
          <ExternalLink className="w-3 h-3 transition-transform group-hover:translate-x-1" />
        </a>
      </CardFooter>
    </Card>
  )
}
