"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function GalleryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState(searchParams.get("type") || "all");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");

  // Update type if URL params change
  useEffect(() => {
    setType(searchParams.get("type") || "all");
    setSort(searchParams.get("sort") || "newest");
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (type !== "all") {
      params.set("type", type);
    }

    if (sort !== "newest") {
      params.set("sort", sort);
    }

    const queryString = params.toString();
    router.push(`/gallery${queryString ? `?${queryString}` : ""}`);
    setIsOpen(false);
  };

  return (
    <div className="mb-6">
      <Button
        variant="outline"
        className="flex items-center gap-2 border-rose-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter className="h-4 w-4" />
        Filter & Sort
      </Button>

      {isOpen && (
        <Card className="mt-2 border-rose-200">
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Filter by Type</h3>
                <RadioGroup
                  value={type}
                  onValueChange={setType}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all">All</Label>
                  </div>
                  {user && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mine" id="mine" />
                      <Label htmlFor="mine">Mine</Label>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pet" id="pet" />
                    <Label htmlFor="pet">Pet to Human</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="human" id="human" />
                    <Label htmlFor="human">Human to Pet</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <h3 className="font-medium mb-2">Sort by</h3>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="most_votes">Most Votes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                className="bg-rose-500 hover:bg-rose-600"
                onClick={applyFilters}
              >
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
