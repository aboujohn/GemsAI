'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { AdminHeader } from '@/components/ui/admin-header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/select';
import { DirectionalContainer } from '@/components/ui/DirectionalContainer';
import { DirectionalFlex } from '@/components/ui/DirectionalFlex';
import { Icons } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';

interface Experiment {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';
  type: 'feature_flag' | 'ui_variant' | 'algorithm' | 'pricing' | 'content';
  start_date: string;
  end_date?: string;
  target_audience: {
    percentage: number;
    criteria: string[];
  };
  variants: {
    id: string;
    name: string;
    description: string;
    weight: number;
    config: any;
  }[];
  metrics: {
    primary: string;
    secondary: string[];
    success_criteria: string;
  };
  results?: {
    participants: number;
    conversions: Record<string, number>;
    statistical_significance: number;
    confidence_interval: number;
    winner?: string;
  };
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ExperimentFormData {
  name: string;
  description: string;
  hypothesis: string;
  type: string;
  target_percentage: number;
  target_criteria: string[];
  primary_metric: string;
  secondary_metrics: string[];
  success_criteria: string;
  variants: {
    name: string;
    description: string;
    weight: number;
    config: string;
  }[];
}

export default function AdminExperiments() {
  const { t, formatDate } = useTranslation();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [formData, setFormData] = useState<ExperimentFormData>({
    name: '',
    description: '',
    hypothesis: '',
    type: 'feature_flag',
    target_percentage: 10,
    target_criteria: [],
    primary_metric: '',
    secondary_metrics: [],
    success_criteria: '',
    variants: [
      { name: 'Control', description: 'Original version', weight: 50, config: '{}' },
      { name: 'Variant A', description: 'Test version', weight: 50, config: '{}' }
    ]
  });
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: ''
  });

  useEffect(() => {
    fetchExperiments();
  }, []);

  const fetchExperiments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/experiments');
      
      if (!response.ok) {
        throw new Error('Failed to fetch experiments');
      }
      
      const data = await response.json();
      setExperiments(data.experiments || []);
    } catch (error) {
      console.error('Failed to fetch experiments:', error);
      
      // Mock data for demo
      const mockExperiments: Experiment[] = [
        {
          id: 'exp-1',
          name: 'Enhanced Story Submission Flow',
          description: 'Testing a simplified 3-step story submission process vs the current 5-step flow',
          hypothesis: 'Reducing steps will increase story completion rate by 15%',
          status: 'running',
          type: 'ui_variant',
          start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          target_audience: {
            percentage: 25,
            criteria: ['new_users', 'mobile_users']
          },
          variants: [
            {
              id: 'control',
              name: 'Control (5 steps)',
              description: 'Current story submission flow',
              weight: 50,
              config: { steps: 5, layout: 'vertical' }
            },
            {
              id: 'variant_a',
              name: 'Simplified (3 steps)',
              description: 'Condensed story submission flow',
              weight: 50,
              config: { steps: 3, layout: 'horizontal' }
            }
          ],
          metrics: {
            primary: 'story_completion_rate',
            secondary: ['time_to_complete', 'user_satisfaction'],
            success_criteria: '15% increase in completion rate with 95% confidence'
          },
          results: {
            participants: 1247,
            conversions: {
              control: 342,
              variant_a: 428
            },
            statistical_significance: 94.2,
            confidence_interval: 0.85,
            winner: 'variant_a'
          },
          created_by: 'admin@gemsai.com',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'exp-2',
          name: 'AI Sketch Generation Timeout',
          description: 'Testing different timeout values for AI sketch generation',
          hypothesis: 'Increasing timeout to 120s will improve success rate without significantly impacting user experience',
          status: 'completed',
          type: 'algorithm',
          start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          target_audience: {
            percentage: 50,
            criteria: ['all_users']
          },
          variants: [
            {
              id: 'control',
              name: 'Current (60s)',
              description: 'Current 60 second timeout',
              weight: 50,
              config: { timeout: 60 }
            },
            {
              id: 'variant_a',
              name: 'Extended (120s)',
              description: 'Extended 120 second timeout',
              weight: 50,
              config: { timeout: 120 }
            }
          ],
          metrics: {
            primary: 'sketch_success_rate',
            secondary: ['user_wait_time', 'abandonment_rate'],
            success_criteria: '10% improvement in success rate'
          },
          results: {
            participants: 2834,
            conversions: {
              control: 2498,
              variant_a: 2687
            },
            statistical_significance: 98.7,
            confidence_interval: 0.95,
            winner: 'variant_a'
          },
          created_by: 'admin@gemsai.com',
          created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'exp-3',
          name: 'Premium Jewelry Pricing',
          description: 'Testing 15% price increase on premium jewelry items',
          hypothesis: 'Premium customers are less price sensitive; 15% increase will improve margins without affecting sales',
          status: 'draft',
          type: 'pricing',
          start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          target_audience: {
            percentage: 30,
            criteria: ['premium_customers', 'repeat_buyers']
          },
          variants: [
            {
              id: 'control',
              name: 'Current Pricing',
              description: 'Standard pricing structure',
              weight: 70,
              config: { price_multiplier: 1.0 }
            },
            {
              id: 'variant_a',
              name: 'Premium Pricing',
              description: '15% price increase',
              weight: 30,
              config: { price_multiplier: 1.15 }
            }
          ],
          metrics: {
            primary: 'revenue_per_user',
            secondary: ['conversion_rate', 'average_order_value'],
            success_criteria: 'Maintain 90% of current conversion rate while increasing revenue'
          },
          created_by: 'admin@gemsai.com',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setExperiments(mockExperiments);
    } finally {
      setLoading(false);
    }
  };

  const createExperiment = async () => {
    try {
      const response = await fetch('/api/admin/experiments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchExperiments();
        setShowCreateDialog(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to create experiment:', error);
    }
  };

  const updateExperimentStatus = async (experimentId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/experiments/${experimentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await fetchExperiments();
      }
    } catch (error) {
      console.error('Failed to update experiment:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      hypothesis: '',
      type: 'feature_flag',
      target_percentage: 10,
      target_criteria: [],
      primary_metric: '',
      secondary_metrics: [],
      success_criteria: '',
      variants: [
        { name: 'Control', description: 'Original version', weight: 50, config: '{}' },
        { name: 'Variant A', description: 'Test version', weight: 50, config: '{}' }
      ]
    });
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          name: `Variant ${String.fromCharCode(65 + prev.variants.length - 1)}`,
          description: '',
          weight: 0,
          config: '{}'
        }
      ]
    }));
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length > 2) {
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index)
      }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature_flag': return Icons.Flag;
      case 'ui_variant': return Icons.Palette;
      case 'algorithm': return Icons.Settings;
      case 'pricing': return Icons.DollarSign;
      case 'content': return Icons.FileText;
      default: return Icons.Beaker;
    }
  };

  const calculateConversionRate = (conversions: number, participants: number) => {
    return participants > 0 ? ((conversions / participants) * 100).toFixed(1) : '0.0';
  };

  const filteredExperiments = experiments.filter(exp => {
    if (filters.status && exp.status !== filters.status) return false;
    if (filters.type && exp.type !== filters.type) return false;
    if (filters.search && !exp.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !exp.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex-1">
        <AdminHeader title="A/B Test Management" subtitle="Manage and monitor experimental features" />
        <DirectionalContainer className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DirectionalContainer>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <AdminHeader 
        title="A/B Test Management" 
        subtitle="Manage and monitor experimental features"
        actions={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Icons.Plus className="h-4 w-4 mr-2" />
            New Experiment
          </Button>
        }
      />
      
      <DirectionalContainer className="p-6 space-y-6">
        {/* Filters */}
        <Card className="p-4">
          <DirectionalFlex className="gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Search experiments..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            
            <Select 
              value={filters.status} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="running">Running</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
            
            <Select 
              value={filters.type} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            >
              <option value="">All Types</option>
              <option value="feature_flag">Feature Flag</option>
              <option value="ui_variant">UI Variant</option>
              <option value="algorithm">Algorithm</option>
              <option value="pricing">Pricing</option>
              <option value="content">Content</option>
            </Select>
            
            <Button 
              onClick={() => setFilters({ status: '', type: '', search: '' })} 
              variant="outline"
            >
              Clear
            </Button>
          </DirectionalFlex>
        </Card>

        {/* Experiments Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Icons.Play className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Running</p>
                <p className="text-xl font-semibold">
                  {experiments.filter(e => e.status === 'running').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icons.CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-semibold">
                  {experiments.filter(e => e.status === 'completed').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Icons.FileText className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Draft</p>
                <p className="text-xl font-semibold">
                  {experiments.filter(e => e.status === 'draft').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Icons.Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Participants</p>
                <p className="text-xl font-semibold">
                  {experiments.reduce((sum, e) => sum + (e.results?.participants || 0), 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Experiments List */}
        <div className="space-y-4">
          {filteredExperiments.map((experiment) => {
            const Icon = getTypeIcon(experiment.type);
            
            return (
              <Card key={experiment.id} className="p-6">
                <DirectionalFlex className="justify-between items-start mb-4">
                  <div className="flex-1">
                    <DirectionalFlex className="items-center gap-3 mb-2">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <h3 className="text-lg font-medium text-gray-900">{experiment.name}</h3>
                      <Badge className={getStatusColor(experiment.status)}>
                        {experiment.status}
                      </Badge>
                      <Badge variant="outline">{experiment.type.replace('_', ' ')}</Badge>
                    </DirectionalFlex>
                    <p className="text-gray-600 mb-2">{experiment.description}</p>
                    <p className="text-sm text-gray-500">
                      <strong>Hypothesis:</strong> {experiment.hypothesis}
                    </p>
                  </div>
                  
                  <DirectionalFlex className="items-center gap-2">
                    <Button
                      onClick={() => {
                        setSelectedExperiment(experiment);
                        setShowDetailsDialog(true);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Icons.Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                    
                    {experiment.status === 'draft' && (
                      <Button
                        onClick={() => updateExperimentStatus(experiment.id, 'running')}
                        size="sm"
                      >
                        <Icons.Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    )}
                    
                    {experiment.status === 'running' && (
                      <Button
                        onClick={() => updateExperimentStatus(experiment.id, 'paused')}
                        variant="outline"
                        size="sm"
                      >
                        <Icons.Pause className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                    )}
                  </DirectionalFlex>
                </DirectionalFlex>
                
                {experiment.results && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-600">Participants</p>
                      <p className="text-lg font-semibold">{experiment.results.participants.toLocaleString()}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Statistical Significance</p>
                      <p className="text-lg font-semibold">{experiment.results.statistical_significance}%</p>
                      <Progress value={experiment.results.statistical_significance} className="h-2 mt-1" />
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Current Winner</p>
                      <p className="text-lg font-semibold text-green-600">
                        {experiment.results.winner ? 
                          experiment.variants.find(v => v.id === experiment.results?.winner)?.name :
                          'No clear winner'
                        }
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="mt-4">
                  <p className="text-xs text-gray-500">
                    Started {formatDate(new Date(experiment.start_date))} • 
                    Target: {experiment.target_audience.percentage}% of users • 
                    Primary metric: {experiment.metrics.primary}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredExperiments.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Beaker className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No experiments found</h3>
            <p className="text-gray-500 mb-4">
              {filters.search || filters.status || filters.type 
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating your first A/B test experiment.'
              }
            </p>
            {!filters.search && !filters.status && !filters.type && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Icons.Plus className="h-4 w-4 mr-2" />
                Create First Experiment
              </Button>
            )}
          </Card>
        )}
      </DirectionalContainer>

      {/* Create Experiment Dialog */}
      {showCreateDialog && (
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <DirectionalFlex className="justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Create New Experiment</h2>
                    <p className="text-gray-500">Set up a new A/B test to optimize your platform</p>
                  </div>
                  <Button
                    onClick={() => setShowCreateDialog(false)}
                    variant="outline"
                    size="sm"
                  >
                    <Icons.X className="h-4 w-4" />
                  </Button>
                </DirectionalFlex>
                
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experiment Name
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Enhanced Checkout Flow"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experiment Type
                      </label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                      >
                        <option value="feature_flag">Feature Flag</option>
                        <option value="ui_variant">UI Variant</option>
                        <option value="algorithm">Algorithm</option>
                        <option value="pricing">Pricing</option>
                        <option value="content">Content</option>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this experiment tests..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hypothesis
                    </label>
                    <Textarea
                      value={formData.hypothesis}
                      onChange={(e) => setFormData(prev => ({ ...prev, hypothesis: e.target.value }))}
                      placeholder="We believe that changing X will result in Y because Z..."
                      rows={2}
                    />
                  </div>

                  {/* Targeting */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Percentage
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.target_percentage}
                        onChange={(e) => setFormData(prev => ({ ...prev, target_percentage: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Metric
                      </label>
                      <Input
                        value={formData.primary_metric}
                        onChange={(e) => setFormData(prev => ({ ...prev, primary_metric: e.target.value }))}
                        placeholder="e.g., conversion_rate"
                      />
                    </div>
                  </div>

                  {/* Variants */}
                  <div>
                    <DirectionalFlex className="justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Variants</h3>
                      <Button onClick={addVariant} variant="outline" size="sm">
                        <Icons.Plus className="h-4 w-4 mr-1" />
                        Add Variant
                      </Button>
                    </DirectionalFlex>
                    
                    <div className="space-y-4">
                      {formData.variants.map((variant, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <DirectionalFlex className="justify-between items-start mb-3">
                            <h4 className="font-medium text-gray-900">Variant {index + 1}</h4>
                            {formData.variants.length > 2 && (
                              <Button
                                onClick={() => removeVariant(index)}
                                variant="outline"
                                size="sm"
                              >
                                <Icons.Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </DirectionalFlex>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Input
                              placeholder="Variant name"
                              value={variant.name}
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                newVariants[index].name = e.target.value;
                                setFormData(prev => ({ ...prev, variants: newVariants }));
                              }}
                            />
                            
                            <Input
                              placeholder="Description"
                              value={variant.description}
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                newVariants[index].description = e.target.value;
                                setFormData(prev => ({ ...prev, variants: newVariants }));
                              }}
                            />
                            
                            <Input
                              type="number"
                              placeholder="Weight %"
                              value={variant.weight}
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                newVariants[index].weight = parseInt(e.target.value) || 0;
                                setFormData(prev => ({ ...prev, variants: newVariants }));
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Success Criteria
                    </label>
                    <Textarea
                      value={formData.success_criteria}
                      onChange={(e) => setFormData(prev => ({ ...prev, success_criteria: e.target.value }))}
                      placeholder="Define when this experiment is considered successful..."
                      rows={2}
                    />
                  </div>
                  
                  <DirectionalFlex className="justify-end gap-3 pt-4 border-t">
                    <Button
                      onClick={() => setShowCreateDialog(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button onClick={createExperiment}>
                      Create Experiment
                    </Button>
                  </DirectionalFlex>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* Experiment Details Dialog */}
      {showDetailsDialog && selectedExperiment && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <DirectionalFlex className="justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedExperiment.name}</h2>
                    <p className="text-gray-500">{selectedExperiment.description}</p>
                  </div>
                  <Button
                    onClick={() => setShowDetailsDialog(false)}
                    variant="outline"
                    size="sm"
                  >
                    <Icons.X className="h-4 w-4" />
                  </Button>
                </DirectionalFlex>
                
                <div className="space-y-6">
                  {/* Status and Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge className={getStatusColor(selectedExperiment.status)}>
                        {selectedExperiment.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-medium">{selectedExperiment.type.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Target Audience</p>
                      <p className="font-medium">{selectedExperiment.target_audience.percentage}% of users</p>
                    </div>
                  </div>

                  {/* Results Summary */}
                  {selectedExperiment.results && (
                    <Card className="p-4">
                      <h3 className="font-medium text-gray-900 mb-4">Results Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Participants</p>
                          <p className="text-2xl font-bold">{selectedExperiment.results.participants.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Statistical Significance</p>
                          <p className="text-2xl font-bold">{selectedExperiment.results.statistical_significance}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Confidence</p>
                          <p className="text-2xl font-bold">{(selectedExperiment.results.confidence_interval * 100).toFixed(0)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Winner</p>
                          <p className="text-lg font-bold text-green-600">
                            {selectedExperiment.results.winner ? 
                              selectedExperiment.variants.find(v => v.id === selectedExperiment.results?.winner)?.name :
                              'No clear winner'
                            }
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Variants Performance */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Variant Performance</h3>
                    <div className="space-y-3">
                      {selectedExperiment.variants.map((variant) => {
                        const conversions = selectedExperiment.results?.conversions[variant.id] || 0;
                        const participants = selectedExperiment.results?.participants || 0;
                        const conversionRate = calculateConversionRate(conversions, participants / selectedExperiment.variants.length);
                        
                        return (
                          <div key={variant.id} className="border rounded-lg p-4">
                            <DirectionalFlex className="justify-between items-center mb-2">
                              <div>
                                <h4 className="font-medium text-gray-900">{variant.name}</h4>
                                <p className="text-sm text-gray-600">{variant.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{conversionRate}%</p>
                                <p className="text-sm text-gray-600">{conversions} conversions</p>
                              </div>
                            </DirectionalFlex>
                            <Progress value={parseFloat(conversionRate)} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Experiment Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Hypothesis</h3>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded">{selectedExperiment.hypothesis}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Success Criteria</h3>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded">{selectedExperiment.metrics.success_criteria}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Metrics</h3>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-600">Primary:</span>
                          <span className="ml-2 font-medium">{selectedExperiment.metrics.primary}</span>
                        </div>
                        {selectedExperiment.metrics.secondary.length > 0 && (
                          <div>
                            <span className="text-sm text-gray-600">Secondary:</span>
                            <span className="ml-2">{selectedExperiment.metrics.secondary.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Timeline</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Started:</span>
                          <span className="ml-2">{formatDate(new Date(selectedExperiment.start_date))}</span>
                        </div>
                        {selectedExperiment.end_date && (
                          <div>
                            <span className="text-gray-600">Ended:</span>
                            <span className="ml-2">{formatDate(new Date(selectedExperiment.end_date))}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600">Created by:</span>
                          <span className="ml-2">{selectedExperiment.created_by}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}