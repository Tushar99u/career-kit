"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Linkedin, Sparkles, Target, Award, MessageSquare, Copy, Check, Plus, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function LinkedInOptimizer() {
  const [activeView, setActiveView] = useState("url"); // "url" or "manual"
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [copiedSection, setCopiedSection] = useState(null);
  const [alert, setAlert] = useState({ show: false, title: "", description: "" });
  const [error, setError] = useState(null);
  
  // Manual input form state
  const [profileData, setProfileData] = useState({
    headline: "",
    summary: "",
    experience: [""],
    skills: [""]
  });

  // Handle form input changes for text fields
  const handleInputChange = (field, value) => {
    setProfileData({
      ...profileData,
      [field]: value
    });
  };

  // Handle array items (experience and skills)
  const handleArrayChange = (index, field, value) => {
    const updatedArray = [...profileData[field]];
    updatedArray[index] = value;
    
    setProfileData({
      ...profileData,
      [field]: updatedArray
    });
  };

  // Add new item to array fields
  const addArrayItem = (field) => {
    setProfileData({
      ...profileData,
      [field]: [...profileData[field], ""]
    });
  };

  // Remove item from array fields
  const removeArrayItem = (index, field) => {
    const updatedArray = [...profileData[field]];
    updatedArray.splice(index, 1);
    
    setProfileData({
      ...profileData,
      [field]: updatedArray.length ? updatedArray : [""]
    });
  };

  const handleOptimize = async () => {
    try {
      setIsLoading(true);
      
      let response;
      
      if (activeView === "url") {
        // URL-based approach
        response = await fetch("/api/linkedin/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ linkedinUrl }),
        });
      } else {
        // Manual input approach
        response = await fetch("/api/linkedin/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ profileData }),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to analyze profile");
      }

      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      setAlert({
        show: true,
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text, section) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setAlert({
        show: true,
        title: "Success",
        description: "Content copied to clipboard",
      });
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      setAlert({
        show: true,
        title: "Error",
        description: "Failed to copy to clipboard",
      });
    }
  };

  const renderInputForm = () => {
    if (activeView === "url") {
      return (
        <div className="flex items-center space-x-2">
          <Linkedin className="h-5 w-5 text-primary" />
          <Input
            placeholder="Enter your LinkedIn profile URL"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className="flex-1"
          />
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your Headline</label>
            <Input
              placeholder="e.g. Senior Product Manager at Tech Company"
              value={profileData.headline}
              onChange={(e) => handleInputChange("headline", e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Your Summary</label>
            <Textarea
              placeholder="Enter your current LinkedIn summary..."
              value={profileData.summary}
              onChange={(e) => handleInputChange("summary", e.target.value)}
              rows={4}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Your Experience</label>
            {profileData.experience.map((exp, index) => (
              <div key={`exp-${index}`} className="flex mb-2">
                <Textarea
                  placeholder="e.g. Led development of feature X that increased user engagement by 40%"
                  value={exp}
                  onChange={(e) => handleArrayChange(index, "experience", e.target.value)}
                  className="flex-1"
                  rows={2}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeArrayItem(index, "experience")}
                  className="ml-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addArrayItem("experience")}
              className="mt-1"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Experience
            </Button>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Your Skills</label>
            {profileData.skills.map((skill, index) => (
              <div key={`skill-${index}`} className="flex mb-2">
                <Input
                  placeholder="e.g. Project Management"
                  value={skill}
                  onChange={(e) => handleArrayChange(index, "skills", e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeArrayItem(index, "skills")}
                  className="ml-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addArrayItem("skills")}
              className="mt-1"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Skill
            </Button>
          </div>
        </div>
      );
    }
  };

  const isFormValid = () => {
    if (activeView === "url") {
      return linkedinUrl.trim() !== "";
    } else {
      return (
        profileData.headline.trim() !== "" || 
        profileData.summary.trim() !== "" || 
        profileData.experience.some(exp => exp.trim() !== "") ||
        profileData.skills.some(skill => skill.trim() !== "")
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">LinkedIn Profile Optimizer</h1>
          <p className="text-muted-foreground">
            Boost your LinkedIn visibility and attract more opportunities with AI-powered optimization
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-4">
              <Tabs value={activeView} onValueChange={setActiveView} className="mb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url">Use LinkedIn URL</TabsTrigger>
                  <TabsTrigger value="manual">Manual Input</TabsTrigger>
                </TabsList>
              </Tabs>

              {renderInputForm()}
              
              <Button 
                onClick={handleOptimize} 
                disabled={!isFormValid() || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Profile...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Optimize Profile
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {suggestions && (
          <Tabs defaultValue="headline" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="headline">Headline</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="headline">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Optimized Headline</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(suggestions.headline, "headline")}
                      >
                        {copiedSection === "headline" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-muted-foreground">{suggestions.headline}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="keywords">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Recommended Keywords</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(suggestions.keywords.join(", "), "keywords")}
                      >
                        {copiedSection === "keywords" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experience">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Award className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Experience Bullet Points</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(suggestions.experience.join("\n"), "experience")}
                      >
                        {copiedSection === "experience" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <ul className="space-y-2">
                      {suggestions.experience.map((point, index) => (
                        <li key={index} className="text-muted-foreground">
                          • {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Profile Summary</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(suggestions.summary, "summary")}
                      >
                        {copiedSection === "summary" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-muted-foreground">{suggestions.summary}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        <AlertDialog open={alert.show} onOpenChange={(open) => setAlert({ ...alert, show: open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{alert.title}</AlertDialogTitle>
              <AlertDialogDescription>{alert.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogAction onClick={() => setAlert({ ...alert, show: false })}>
              OK
            </AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}