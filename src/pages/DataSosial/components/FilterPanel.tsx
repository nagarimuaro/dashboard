import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { X } from "lucide-react";
import { rtList, rwList, getStatusColor } from "@/constants/socialData";

interface FilterPanelProps {
  isOpen: boolean;
  config: { statusOptions: string[] };
  jorongList: string[];
  filterStatuses: string[];
  setFilterStatuses: React.Dispatch<React.SetStateAction<string[]>>;
  filterJorongs: string[];
  setFilterJorongs: React.Dispatch<React.SetStateAction<string[]>>;
  filterRTs: string[];
  setFilterRTs: React.Dispatch<React.SetStateAction<string[]>>;
  filterRWs: string[];
  setFilterRWs: React.Dispatch<React.SetStateAction<string[]>>;
  toggleFilter: (
    value: string | number,
    currentFilters: (string | number)[],
    setFilters: React.Dispatch<React.SetStateAction<any[]>>
  ) => void;
  activeFilterCount: number;
}

export function FilterPanel({
  isOpen,
  config,
  jorongList,
  filterStatuses,
  setFilterStatuses,
  filterJorongs,
  setFilterJorongs,
  filterRTs,
  setFilterRTs,
  filterRWs,
  setFilterRWs,
  toggleFilter,
  activeFilterCount,
}: FilterPanelProps) {
  return (
    <>
      <Collapsible open={isOpen}>
        <CollapsibleContent>
          <Card>
            <CardContent className="py-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1.5 block">Status</Label>
                  <div className="flex flex-wrap gap-2">
                    {config.statusOptions.map((status) => (
                      <div key={status} className="flex items-center space-x-1.5">
                        <Checkbox
                          id={`status-${status}`}
                          checked={filterStatuses.includes(status)}
                          onCheckedChange={() => toggleFilter(status, filterStatuses, setFilterStatuses)}
                          className="w-3.5 h-3.5"
                        />
                        <label htmlFor={`status-${status}`} className="text-xs cursor-pointer flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(status)}`}></span>
                          {status}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Jorong Filter */}
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1.5 block">Jorong</Label>
                  <div className="flex flex-wrap gap-2">
                    {jorongList.map((jorong) => (
                      <div key={jorong} className="flex items-center space-x-1.5">
                        <Checkbox
                          id={`jorong-${jorong}`}
                          checked={filterJorongs.includes(jorong)}
                          onCheckedChange={() => toggleFilter(jorong, filterJorongs, setFilterJorongs)}
                          className="w-3.5 h-3.5"
                        />
                        <label htmlFor={`jorong-${jorong}`} className="text-xs cursor-pointer">
                          {jorong}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RT Filter */}
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1.5 block">RT</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {rtList.map((rt) => (
                      <div key={rt} className="flex items-center space-x-1">
                        <Checkbox
                          id={`rt-${rt}`}
                          checked={filterRTs.includes(rt)}
                          onCheckedChange={() => toggleFilter(rt, filterRTs, setFilterRTs)}
                          className="w-3.5 h-3.5"
                        />
                        <label htmlFor={`rt-${rt}`} className="text-xs cursor-pointer">
                          {rt}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RW Filter */}
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1.5 block">RW</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {rwList.map((rw) => (
                      <div key={rw} className="flex items-center space-x-1">
                        <Checkbox
                          id={`rw-${rw}`}
                          checked={filterRWs.includes(rw)}
                          onCheckedChange={() => toggleFilter(rw, filterRWs, setFilterRWs)}
                          className="w-3.5 h-3.5"
                        />
                        <label htmlFor={`rw-${rw}`} className="text-xs cursor-pointer">
                          {rw}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filterStatuses.map((status) => (
            <Badge key={status} variant="secondary" className="bg-blue-100 text-blue-700">
              Status: {status}
              <X
                className="w-3 h-3 ml-1 cursor-pointer hover:text-blue-900"
                onClick={() => setFilterStatuses(filterStatuses.filter((s) => s !== status))}
              />
            </Badge>
          ))}
          {filterJorongs.map((jorong) => (
            <Badge key={jorong} variant="secondary" className="bg-green-100 text-green-700">
              Jorong: {jorong}
              <X
                className="w-3 h-3 ml-1 cursor-pointer hover:text-green-900"
                onClick={() => setFilterJorongs(filterJorongs.filter((j) => j !== jorong))}
              />
            </Badge>
          ))}
          {filterRTs.map((rt) => (
            <Badge key={rt} variant="secondary" className="bg-purple-100 text-purple-700">
              RT: {rt}
              <X
                className="w-3 h-3 ml-1 cursor-pointer hover:text-purple-900"
                onClick={() => setFilterRTs(filterRTs.filter((r) => r !== rt))}
              />
            </Badge>
          ))}
          {filterRWs.map((rw) => (
            <Badge key={rw} variant="secondary" className="bg-orange-100 text-orange-700">
              RW: {rw}
              <X
                className="w-3 h-3 ml-1 cursor-pointer hover:text-orange-900"
                onClick={() => setFilterRWs(filterRWs.filter((r) => r !== rw))}
              />
            </Badge>
          ))}
        </div>
      )}
    </>
  );
}
