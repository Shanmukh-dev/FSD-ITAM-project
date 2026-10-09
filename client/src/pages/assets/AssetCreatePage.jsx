import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Server,
  Save,
  Monitor,
  KeyRound,
  ShieldCheck,
  Calendar,
  Layers,
  Cpu,
} from 'lucide-react';
import api from '../../services/api';
import Card, { CardHeader } from '../../components/ui/Card';
import Input, { Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import {
  ASSET_TYPES,
  HARDWARE_CATEGORIES,
  DIGITAL_CATEGORIES,
  DIGITAL_LICENSE_TYPES,
  BILLING_CYCLES,
  ASSET_CONDITIONS,
} from '../../utils/constants';

export const AssetCreatePage = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [assetType, setAssetType] = useState(ASSET_TYPES.PHYSICAL);

  const [formData, setFormData] = useState({
    assetTag: '',
    name: '',
    category: 'LAPTOP',
    brand: '',
    model: '',
    serialNumber: '',
    vendor: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: '',
    warrantyExpiry: '',
    department: '',
    location: '',
    condition: 'NEW',
    usefulLifeYears: '4',

    // Digital Specific Details
    licenseKey: '',
    licenseType: 'SUBSCRIPTION',
    seatsTotal: '1',
    contractNumber: '',
    contractType: 'Software License Agreement',
    billingCycle: 'ANNUAL',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    autoRenew: false,
  });

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/departments');
        if (res.data.success) {
          setDepartments(res.data.departments);
        }
      } catch (err) {}
    };
    fetchDepts();
  }, []);

  const handleTypeChange = (newType) => {
    setAssetType(newType);
    if (newType === ASSET_TYPES.DIGITAL) {
      setFormData((prev) => ({
        ...prev,
        category: 'SOFTWARE_LICENSE',
        condition: 'NOT_APPLICABLE',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        category: 'LAPTOP',
        condition: 'NEW',
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const isDigital = assetType === ASSET_TYPES.DIGITAL;

      const payload = {
        assetTag: formData.assetTag.trim().toUpperCase(),
        name: formData.name.trim(),
        category: formData.category,
        assetType,
        brand: formData.brand.trim() || (isDigital ? (formData.vendor || 'Digital Provider') : ''),
        model: formData.model.trim() || (isDigital ? 'Software / License' : ''),
        serialNumber: isDigital ? (formData.serialNumber?.trim() || undefined) : formData.serialNumber.trim(),
        vendor: formData.vendor?.trim(),
        purchaseDate: formData.purchaseDate,
        purchasePrice: Number(formData.purchasePrice),
        warrantyExpiry: formData.warrantyExpiry || null,
        department: formData.department || null,
        location: formData.location?.trim() || (isDigital ? 'Cloud / SaaS' : ''),
        condition: isDigital ? 'NOT_APPLICABLE' : formData.condition,
        depreciation: {
          usefulLifeYears: Number(formData.usefulLifeYears) || (isDigital ? 1 : 3),
          method: isDigital ? 'SUBSCRIPTION_AMORTIZATION' : 'STRAIGHT_LINE',
        },
      };

      if (isDigital) {
        payload.digitalDetails = {
          licenseKey: formData.licenseKey?.trim() || '',
          licenseType: formData.licenseType,
          seatsTotal: Number(formData.seatsTotal) || 1,
          contractNumber: formData.contractNumber?.trim() || '',
          contractType: formData.contractType?.trim() || '',
          billingCycle: formData.billingCycle,
          validFrom: formData.validFrom || null,
          validUntil: formData.validUntil || null,
          autoRenew: Boolean(formData.autoRenew),
        };
      }

      const res = await api.post('/assets', payload);
      if (res.data.success) {
        navigate(`/assets/${res.data.asset._id}`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to register asset. Check required fields.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link & Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/assets"
          className="p-2 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Add New Asset
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Register hardware inventory or digital software licenses and contracts.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-destructive/15 border border-rose-200 dark:border-destructive/30 rounded-xl p-4 text-xs text-rose-800 dark:text-rose-200">
          {error}
        </div>
      )}

      {/* Asset Type Selector */}
      <div className="bg-white dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleTypeChange(ASSET_TYPES.PHYSICAL)}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-medium text-xs sm:text-sm transition-all ${
            assetType === ASSET_TYPES.PHYSICAL
              ? 'bg-primary text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50'
          }`}
        >
          <Monitor size={18} />
          <span>Physical Hardware</span>
          <span className="text-[10px] opacity-75 font-normal hidden sm:inline">
            (Laptops, Monitors, Keyboards, Mice, Servers)
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTypeChange(ASSET_TYPES.DIGITAL)}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-medium text-xs sm:text-sm transition-all ${
            assetType === ASSET_TYPES.DIGITAL
              ? 'bg-primary text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50'
          }`}
        >
          <KeyRound size={18} />
          <span>Digital & Software</span>
          <span className="text-[10px] opacity-75 font-normal hidden sm:inline">
            (Licenses, SaaS, Contracts, Cloud)
          </span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Classification & Specs */}
        {assetType === ASSET_TYPES.PHYSICAL ? (
          <Card>
            <CardHeader
              title="1. Physical Device Information"
              subtitle="Device specifications, hardware brand, model, and serial number"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                id="assetTag"
                name="assetTag"
                label="Asset Tag"
                placeholder="e.g. LAP-108 or PER-KB-02"
                value={formData.assetTag}
                onChange={handleChange}
                required
              />
              <Input
                id="name"
                name="name"
                label="Equipment Name"
                placeholder="e.g. Dell Latitude 5440 or Logitech MX Keys"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Select
                id="category"
                name="category"
                label="Hardware Category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {HARDWARE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </option>
                ))}
              </Select>
              <Input
                id="brand"
                name="brand"
                label="Brand / Manufacturer"
                placeholder="e.g. Apple, Dell, Logitech, HP"
                value={formData.brand}
                onChange={handleChange}
                required
              />
              <Input
                id="model"
                name="model"
                label="Model"
                placeholder="e.g. 5440 14-inch or Master 3S"
                value={formData.model}
                onChange={handleChange}
                required
              />
              <Input
                id="serialNumber"
                name="serialNumber"
                label="Serial Number"
                placeholder="e.g. SN-883491-X"
                value={formData.serialNumber}
                onChange={handleChange}
                required
              />
            </div>
          </Card>
        ) : (
          <Card>
            <CardHeader
              title="1. Software & License Specifications"
              subtitle="Software title, publisher, license model, seat capacity, and license keys"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                id="assetTag"
                name="assetTag"
                label="Digital Asset Tag"
                placeholder="e.g. LIC-JET-01 or SAAS-FIGMA-04"
                value={formData.assetTag}
                onChange={handleChange}
                required
              />
              <Input
                id="name"
                name="name"
                label="Software / Service Name"
                placeholder="e.g. JetBrains All Products or Figma Enterprise"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Select
                id="category"
                name="category"
                label="Digital Category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {DIGITAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </option>
                ))}
              </Select>
              <Input
                id="brand"
                name="brand"
                label="Publisher / Provider"
                placeholder="e.g. JetBrains, Microsoft, Adobe, AWS"
                value={formData.brand}
                onChange={handleChange}
              />
              <Select
                id="licenseType"
                name="licenseType"
                label="License Model"
                value={formData.licenseType}
                onChange={handleChange}
                required
              >
                {DIGITAL_LICENSE_TYPES.map((lt) => (
                  <option key={lt} value={lt}>
                    {lt.replace(/_/g, ' ')}
                  </option>
                ))}
              </Select>
              <Input
                id="seatsTotal"
                name="seatsTotal"
                type="number"
                min="1"
                label="Total Seat Capacity"
                placeholder="e.g. 25"
                value={formData.seatsTotal}
                onChange={handleChange}
                required
              />
              <div className="sm:col-span-2 lg:col-span-3">
                <Input
                  id="licenseKey"
                  name="licenseKey"
                  label="License / Product Key / Portal Access URL"
                  placeholder="e.g. XXXX-XXXX-XXXX-XXXX or https://admin.microsoft.com"
                  value={formData.licenseKey}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Section 2: Procurement & Commercials */}
        <Card>
          <CardHeader
            title={assetType === ASSET_TYPES.PHYSICAL ? "2. Purchase & Valuation" : "2. Commercials & Subscription Terms"}
            subtitle={
              assetType === ASSET_TYPES.PHYSICAL
                ? "Purchase date, price, warranty, and estimated lifespan"
                : "Contract pricing, validity period, and renewal schedule"
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              id="vendor"
              name="vendor"
              label="Vendor / Supplier / Reseller"
              placeholder="e.g. CDW Enterprise, Direct, Ingram"
              value={formData.vendor}
              onChange={handleChange}
            />
            <Input
              id="purchaseDate"
              name="purchaseDate"
              type="date"
              label={assetType === ASSET_TYPES.PHYSICAL ? "Purchase Date" : "Effective / Purchase Date"}
              value={formData.purchaseDate}
              onChange={handleChange}
              required
            />
            <Input
              id="purchasePrice"
              name="purchasePrice"
              type="number"
              min="0"
              step="any"
              label="Purchase / License Cost (₹)"
              placeholder="85000"
              value={formData.purchasePrice}
              onChange={handleChange}
              required
            />

            {assetType === ASSET_TYPES.PHYSICAL ? (
              <>
                <Input
                  id="warrantyExpiry"
                  name="warrantyExpiry"
                  type="date"
                  label="Warranty Expiry Date"
                  value={formData.warrantyExpiry}
                  onChange={handleChange}
                />
                <Input
                  id="usefulLifeYears"
                  name="usefulLifeYears"
                  type="number"
                  min="1"
                  max="20"
                  label="Useful Life (Years)"
                  value={formData.usefulLifeYears}
                  onChange={handleChange}
                  required
                />
                <Select
                  id="condition"
                  name="condition"
                  label="Initial Condition"
                  value={formData.condition}
                  onChange={handleChange}
                >
                  {ASSET_CONDITIONS.filter((c) => c !== 'NOT_APPLICABLE').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </>
            ) : (
              <>
                <Input
                  id="validUntil"
                  name="validUntil"
                  type="date"
                  label="Expiration / Renewal Date"
                  value={formData.validUntil}
                  onChange={handleChange}
                />
                <Select
                  id="billingCycle"
                  name="billingCycle"
                  label="Billing Cycle"
                  value={formData.billingCycle}
                  onChange={handleChange}
                >
                  {BILLING_CYCLES.map((bc) => (
                    <option key={bc} value={bc}>
                      {bc.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Select>
                <Input
                  id="contractNumber"
                  name="contractNumber"
                  label="Contract / Agreement ID"
                  placeholder="e.g. MSA-2024-912"
                  value={formData.contractNumber}
                  onChange={handleChange}
                />
                <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-2 pt-2">
                  <input
                    id="autoRenew"
                    name="autoRenew"
                    type="checkbox"
                    checked={formData.autoRenew}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-white/20 dark:bg-slate-800"
                  />
                  <label htmlFor="autoRenew" className="text-xs text-slate-700 dark:text-slate-300">
                    Auto-renew subscription at end of billing term
                  </label>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Section 3: Organization & Allocation */}
        <Card>
          <CardHeader
            title="3. Department Allocation & Environment"
            subtitle="Department assignment and physical desk or cloud environment"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="department"
              name="department"
              label="Assigned Department"
              value={formData.department}
              onChange={handleChange}
            >
              <option value="">-- No Department (Unassigned / Organization-wide) --</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </Select>

            <Input
              id="location"
              name="location"
              label={assetType === ASSET_TYPES.PHYSICAL ? "Location / Desk / Rack" : "Hosting / Cloud URL / Tenant"}
              placeholder={
                assetType === ASSET_TYPES.PHYSICAL
                  ? "e.g. Floor 2, Desk 304 or Server Room B"
                  : "e.g. AWS us-east-1, Azure EU, or https://company.figma.com"
              }
              value={formData.location}
              onChange={handleChange}
            />
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/assets">
            <Button variant="ghost" size="md">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
          >
            <Save size={16} />
            <span>Save {assetType === ASSET_TYPES.DIGITAL ? 'Digital Asset' : 'Hardware Asset'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AssetCreatePage;
