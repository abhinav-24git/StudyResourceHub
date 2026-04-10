"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Youtube, BookOpen, Globe, Loader2, Search } from "lucide-react"
import { ResourceCard } from "@/components/ResourceCard"
import { Skeleton } from "@/components/ui/skeleton"

export default function PathFinderPage() {
  const [syllabus, setSyllabus] = useState("")
  const [configs, setConfigs] = useState({
    youtube: { enabled: true, quantity: 3 },
    gfg: { enabled: true, quantity: 3 },
    general: { enabled: true, quantity: 3 }
  })
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const updateConfig = (id: string, field: 'enabled' | 'quantity', value: any) => {
    setConfigs(prev => ({
      ...prev,
      [id]: { 
        ...(prev[id as keyof typeof prev]), 
        [field]: value 
      }
    }))
  }

  const generatePath = async () => {
    if (!syllabus.trim()) return

    setLoading(true)
    setResults([])

    // Simple topic extraction: split by line or comma
    const topics = syllabus
      .split(/[\n,;]/)
      .map(t => t.trim())
      .filter(t => t.length > 2)
      .slice(0, 5) // Limit to 5 topics for MVP

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics,
          configs
        })
      })

      const data = await response.json()
      if (data.results) {
        setResults(data.results)
      }
    } catch (error) {
      console.error("Failed to generate path:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header Section */}
      <header className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-4">
          <Sparkles className="w-3 h-3" />
          Powered by AI Logic
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent">
          StudyResourceHub
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Transform your syllabus into a high-octane learning journey.
          Custom-tailored resources delivered in seconds.
        </p>
      </header>

      {/* Control Dashboard */}
      <section className="grid md:grid-cols-5 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
        <div className="md:col-span-3 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold tracking-wide text-foreground/80 flex items-center gap-2">
              <Search className="w-4 h-4" />
              TOPICS / SYLLABUS
            </label>
            <Textarea
              placeholder="Paste your syllabus topics here... (e.g., React Hooks, Node.js Streams, Binary Search)"
              className="min-h-[250px] glass resize-none focus-visible:ring-purple-500/50 transition-all text-base p-4"
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
            />
          </div>
        </div>

        <div className="md:col-span-2 space-y-6 glass p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-6">
            <label className="text-base font-bold tracking-wide block border-b border-white/5 pb-2">PREFERENCES</label>
            <div className="space-y-4">
              <PlatformControl 
                id="youtube" 
                label="YouTube Videos" 
                icon={<Youtube className="text-red-500" />} 
                enabled={configs.youtube.enabled}
                quantity={configs.youtube.quantity}
                onToggle={(val: any) => updateConfig('youtube', 'enabled', val)}
                onQuantityChange={(val: any) => updateConfig('youtube', 'quantity', val)}
              />
              <PlatformControl 
                id="gfg" 
                label="GeeksforGeeks" 
                icon={<BookOpen className="text-green-500" />} 
                enabled={configs.gfg.enabled}
                quantity={configs.gfg.quantity}
                onToggle={(val: any) => updateConfig('gfg', 'enabled', val)}
                onQuantityChange={(val: any) => updateConfig('gfg', 'quantity', val)}
              />
              <PlatformControl 
                id="general" 
                label="General Web" 
                icon={<Globe className="text-blue-500" />} 
                enabled={configs.general.enabled}
                quantity={configs.general.quantity}
                onToggle={(val: any) => updateConfig('general', 'enabled', val)}
                onQuantityChange={(val: any) => updateConfig('general', 'quantity', val)}
              />
            </div>
          </div>

          <Button 
            className="w-full h-14 btn-primary-gradient text-lg font-bold rounded-xl mt-6 group"
            onClick={generatePath}
            disabled={loading || !syllabus.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                CURATING PATH...
              </>
            ) : (
              <>
                GENERATE PATH
                <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Results Section */}
      <section className="space-y-12 pb-20">
        {loading ? (
          <div className="space-y-12">
            {[1, 2].map(i => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-48 rounded-lg bg-white/5" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(j => (
                    <Skeleton key={j} className="h-64 rounded-2xl bg-white/5" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          results.map((topicResult, idx) => (
            <div key={idx} className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center gap-4">
                <div className="h-px flex-grow bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                <h2 className="text-2xl font-bold tracking-tight text-white/90 px-4">
                  {topicResult.topic}
                </h2>
                <div className="h-px flex-grow bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {topicResult.resources.map((resource: any, rIdx: number) => (
                  <ResourceCard key={rIdx} resource={resource} />
                ))}
              </div>
            </div>
          ))
        )}

        {!loading && results.length === 0 && syllabus.trim() && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in zoom-in-95">
             <Search className="w-12 h-12 mb-4 opacity-10" />
             <p>Your learning path will appear here.</p>
          </div>
        )}
      </section>
    </div>
  )
}

function PlatformControl({ id, label, icon, enabled, quantity, onToggle, onQuantityChange, isDisabled = false }: any) {
  return (
    <div 
      title={isDisabled ? "Future implementation" : undefined}
      className={`flex items-center justify-between p-3 rounded-xl border transition-all
        ${isDisabled ? 'opacity-30 grayscale cursor-not-allowed border-white/5 bg-transparent' : 
          enabled ? 'bg-white/5 border-white/10 ring-1 ring-white/10' : 'bg-transparent border-white/5 opacity-40 grayscale hover:opacity-70'}`}
    >
      <div className="flex items-center gap-3">
        <Checkbox 
          id={id} 
          checked={enabled} 
          onCheckedChange={onToggle}
          disabled={isDisabled}
          className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
        />
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-sm hidden sm:inline">{label}</span>
          <span className="font-semibold text-xs sm:hidden">{label.split(' ')[0]}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Qty:</span>
        <input 
          type="number"
          min={1}
          max={10}
          value={quantity}
          disabled={!enabled}
          onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
          className="w-12 h-8 bg-black/40 border border-white/10 rounded-md text-center text-xs font-bold focus:outline-none focus:ring-1 focus:ring-purple-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        />
      </div>
    </div>
  )
}
