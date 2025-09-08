"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { Search, X, Clock, FileText, Users, MessageSquare, Receipt, Folder, Star, ArrowRight } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import toast from "react-hot-toast";

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
}

interface SearchResult {
  id: string;
  title: string;
  type: string;
  description?: string;
  status?: string;
  category?: string;
  featured?: boolean;
  client?: { name: string; email: string };
  project?: { title: string; id: string };
  sender?: { name: string; role: string };
  url?: string;
}

const SEARCH_TYPES = [
  { id: 'all', label: 'All', icon: Search },
  { id: 'projects', label: 'Projects', icon: Folder },
  { id: 'portfolio', label: 'Portfolio', icon: Star },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'files', label: 'Files', icon: FileText },
] as const;

export function GlobalSearch({ className = "", placeholder = "Search everything...", size = "md" }: GlobalSearchProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'projects' | 'portfolio' | 'messages' | 'invoices' | 'clients' | 'files'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Global search query
  const { data: searchResults, isLoading } = trpc.search.global.useQuery(
    { 
      query: debouncedQuery, 
      type: selectedType,
      limit: 8
    },
    { 
      enabled: debouncedQuery.length >= 2,
      retry: false
    }
  );

  // Suggestions query for autocomplete
  const { data: suggestions } = trpc.search.suggestions.useQuery(
    {
      query: debouncedQuery,
      type: selectedType === 'all' ? 'projects' : selectedType as any,
      limit: 5
    },
    {
      enabled: debouncedQuery.length >= 1 && debouncedQuery.length < 3,
      retry: false
    }
  );

  // Flatten search results
  const flattenedResults: SearchResult[] = React.useMemo(() => {
    if (!searchResults) return [];
    
    const results: SearchResult[] = [];
    
    // Projects
    searchResults.projects?.forEach(project => {
      results.push({
        id: project.id,
        title: project.title,
        type: 'project',
        description: project.description,
        status: project.status,
        client: project.client,
        url: `/admin/projects/edit/${project.id}`
      });
    });

    // Portfolio
    searchResults.portfolio?.forEach(item => {
      results.push({
        id: item.id,
        title: item.title,
        type: 'portfolio',
        description: item.description,
        category: item.category,
        featured: item.featured,
        url: `/admin/portfolio/edit/${item.id}`
      });
    });

    // Messages (Admin only)
    if (session?.user.role === "ADMIN") {
      searchResults.messages?.forEach(message => {
        results.push({
          id: message.id,
          title: message.content.substring(0, 60) + (message.content.length > 60 ? '...' : ''),
          type: 'message',
          description: `In ${message.project?.title || 'Unknown Project'}`,
          sender: message.sender,
          project: message.project,
          url: `/admin/chat?project=${message.project?.id}`
        });
      });

      // Invoices (Admin only)
      searchResults.invoices?.forEach(invoice => {
        results.push({
          id: invoice.id,
          title: invoice.invoiceNumber,
          type: 'invoice',
          description: invoice.description || `${invoice.client?.name} - $${invoice.amount}`,
          status: invoice.status,
          client: invoice.client,
          url: `/admin/invoices/${invoice.id}`
        });
      });

      // Clients (Admin only)
      searchResults.clients?.forEach(client => {
        results.push({
          id: client.id,
          title: client.name || client.email,
          type: 'client',
          description: `${client._count.clientProjects} projects`,
          url: `/admin/users`
        });
      });

      // Files (Admin only)
      searchResults.files?.forEach(file => {
        results.push({
          id: file.id,
          title: file.fileName,
          type: 'file',
          description: file.project?.title || 'No project',
          url: file.url
        });
      });
    }

    return results;
  }, [searchResults, session]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, flattenedResults.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (flattenedResults[selectedIndex]) {
          handleResultClick(flattenedResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setQuery("");
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, flattenedResults, selectedIndex]);

  // Global keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Local keyboard navigation
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wmx-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load recent searches:', e);
      }
    }
  }, []);

  const handleResultClick = (result: SearchResult) => {
    // Add to recent searches
    const newRecentSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('wmx-recent-searches', JSON.stringify(newRecentSearches));

    // Navigate to result
    if (result.url) {
      if (result.type === 'file') {
        window.open(result.url, '_blank');
      } else {
        router.push(result.url);
      }
    }

    // Close search
    setIsOpen(false);
    setQuery("");
    
    // Show success toast
    toast.success(`Opening ${result.type}: ${result.title}`, {
      style: {
        background: '#00FF00',
        color: '#111111',
        border: '2px solid #111111',
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 700,
      }
    });
  };

  const handleSuggestionClick = (suggestion: any) => {
    setQuery(suggestion.title);
    inputRef.current?.focus();
  };

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
    inputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('wmx-recent-searches');
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'project': return <Folder size={16} />;
      case 'portfolio': return <Star size={16} />;
      case 'message': return <MessageSquare size={16} />;
      case 'invoice': return <Receipt size={16} />;
      case 'client': return <Users size={16} />;
      case 'file': return <FileText size={16} />;
      default: return <Search size={16} />;
    }
  };

  const getResultBadgeColor = (type: string, status?: string, featured?: boolean) => {
    if (type === 'project') {
      switch (status) {
        case 'COMPLETED': return '#00FF00';
        case 'IN_PROGRESS': return '#FFC700';
        case 'REVIEW': return '#FF3EA5';
        default: return '#00FFFF';
      }
    }
    if (type === 'portfolio' && featured) return '#FFC700';
    if (type === 'invoice') {
      switch (status) {
        case 'PAID': return '#00FF00';
        case 'PENDING': return '#FFC700';
        case 'OVERDUE': return '#FF3EA5';
        default: return '#00FFFF';
      }
    }
    return '#00FFFF';
  };

  const highlightText = (text: string, query: string) => {
    if (!query || query.length < 2) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} style={{
          backgroundColor: '#FFC700',
          color: '#111111',
          fontWeight: 700,
          padding: '0 2px'
        }}>
          {part}
        </mark>
      ) : part
    );
  };

  const sizeClasses = {
    sm: "h-8 text-sm",
    md: "h-10 text-base", 
    lg: "h-12 text-lg"
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div style={{
        position: 'relative',
        backgroundColor: '#FFFFFF',
        border: '2px solid #111111',
        boxShadow: isOpen ? '4px 4px 0px #3D52F1' : '2px 2px 0px #111111',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Search size={20} style={{
          marginLeft: '12px',
          color: '#666666'
        }} />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`flex-1 px-3 py-2 outline-none bg-transparent font-medium ${sizeClasses[size]}`}
          style={{
            fontFamily: 'Poppins, sans-serif',
            color: '#111111'
          }}
        />

        {/* Keyboard shortcut hint */}
        {!query && (
          <div style={{
            marginRight: '12px',
            fontSize: '12px',
            color: '#666666',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            backgroundColor: '#F0F0F0',
            padding: '2px 6px',
            border: '1px solid #CCCCCC'
          }}>
            ⌘K
          </div>
        )}

        {/* Clear button */}
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            style={{
              marginRight: '8px',
              padding: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#666666'
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Search Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 50,
          marginTop: '4px',
          backgroundColor: '#FFFFFF',
          border: '3px solid #111111',
          boxShadow: '6px 6px 0px #111111',
          borderRadius: '0px',
          maxHeight: '600px',
          overflowY: 'auto'
        }}>
          {/* Search Type Filters */}
          <div style={{
            padding: '12px',
            borderBottom: '2px solid #111111',
            backgroundColor: '#F8F9FF'
          }}>
            <div style={{
              display: 'flex',
              gap: '4px',
              flexWrap: 'wrap'
            }}>
              {SEARCH_TYPES.map(type => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                const isAdminOnly = ['messages', 'invoices', 'clients', 'files'].includes(type.id);
                
                if (isAdminOnly && session?.user.role !== "ADMIN") return null;
                
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id as any)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      fontFamily: 'Poppins, sans-serif',
                      backgroundColor: isSelected ? '#3D52F1' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#111111',
                      border: '2px solid #111111',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = '#FFC700';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                      }
                    }}
                  >
                    <Icon size={12} />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && query.length >= 2 && (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#666666',
              fontFamily: 'Poppins, sans-serif'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #3D52F1',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                margin: '0 auto 8px',
                animation: 'spin 1s linear infinite'
              }} />
              Searching...
            </div>
          )}

          {/* Search Results */}
          {!isLoading && query.length >= 2 && flattenedResults.length > 0 && (
            <div>
              <div style={{
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#666666',
                fontFamily: 'Poppins, sans-serif',
                backgroundColor: '#F8F9FF'
              }}>
                Results ({flattenedResults.length})
              </div>
              {flattenedResults.map((result, index) => (
                <div
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  style={{
                    padding: '12px',
                    borderBottom: index < flattenedResults.length - 1 ? '1px solid #E0E0E0' : 'none',
                    backgroundColor: index === selectedIndex ? '#FFC700' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div style={{
                    backgroundColor: getResultBadgeColor(result.type, result.status, result.featured),
                    padding: '8px',
                    border: '2px solid #111111',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#111111'
                  }}>
                    {getResultIcon(result.type)}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#111111',
                      fontFamily: 'Poppins, sans-serif',
                      marginBottom: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {highlightText(result.title, query)}
                    </div>
                    {result.description && (
                      <div style={{
                        fontSize: '12px',
                        color: '#666666',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {highlightText(result.description, query)}
                      </div>
                    )}
                    <div style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#3D52F1',
                      marginTop: '2px'
                    }}>
                      {result.type}
                      {result.status && ` • ${result.status}`}
                      {result.category && ` • ${result.category}`}
                    </div>
                  </div>
                  
                  <ArrowRight size={14} style={{ color: '#666666' }} />
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && query.length >= 2 && flattenedResults.length === 0 && (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#666666',
              fontFamily: 'Poppins, sans-serif'
            }}>
              <Search size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                No results found
              </div>
              <div style={{ fontSize: '14px' }}>
                Try different keywords or check your spelling
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions && suggestions.length > 0 && query.length >= 1 && query.length < 3 && (
            <div>
              <div style={{
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#666666',
                fontFamily: 'Poppins, sans-serif',
                backgroundColor: '#F8F9FF'
              }}>
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={`suggestion-${suggestion.id}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{
                    padding: '8px 12px',
                    borderBottom: index < suggestions.length - 1 ? '1px solid #E0E0E0' : 'none',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#111111',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8F9FF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                >
                  {getResultIcon(suggestion.type)}
                  {suggestion.title}
                  <div style={{
                    fontSize: '10px',
                    color: '#3D52F1',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    marginLeft: 'auto'
                  }}>
                    {suggestion.type}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div>
              <div style={{
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#666666',
                fontFamily: 'Poppins, sans-serif',
                backgroundColor: '#F8F9FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                Recent Searches
                <button
                  onClick={clearRecentSearches}
                  style={{
                    fontSize: '10px',
                    color: '#FF3EA5',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    fontWeight: 600
                  }}
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((recentQuery, index) => (
                <div
                  key={`recent-${index}`}
                  onClick={() => handleRecentSearchClick(recentQuery)}
                  style={{
                    padding: '8px 12px',
                    borderBottom: index < recentSearches.length - 1 ? '1px solid #E0E0E0' : 'none',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#111111',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8F9FF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                >
                  <Clock size={14} style={{ color: '#666666' }} />
                  {recentQuery}
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!query && recentSearches.length === 0 && (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#666666',
              fontFamily: 'Poppins, sans-serif'
            }}>
              <Search size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                Global Search
              </div>
              <div style={{ fontSize: '14px', marginBottom: '12px' }}>
                Search projects, portfolio, messages, and more
              </div>
              <div style={{
                fontSize: '12px',
                color: '#3D52F1',
                fontWeight: 600
              }}>
                Press ⌘K to search from anywhere
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
