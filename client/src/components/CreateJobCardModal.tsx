import React, { useState, useEffect } from 'react';
import { X, Plus, Wrench } from 'lucide-react';
import { Customer, Vehicle } from '../types';
import { api } from '../api';

interface CreateJobCardModalProps {
  onClose: () => void;
  onSuccess: (newJob: any) => void;
}

export const CreateJobCardModal: React.FC<CreateJobCardModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [serviceType, setServiceType] = useState('Full Periodic Service');
  const [priority, setPriority] = useState('NORMAL');
  const [concerns, setConcerns] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('4500');
  const [loading, setLoading] = useState(false);

  // New customer quick-toggle
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRegNo, setNewRegNo] = useState('');
  const [newMake, setNewMake] = useState('Maruti');
  const [newModel, setNewModel] = useState('Brezza');

  useEffect(() => {
    api.getCustomers().then(setCustomers).catch(console.error);
  }, []);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let custId = selectedCustomerId;
      let vehId = selectedVehicleId;

      if (isNewCustomer) {
        const createdCust = await api.createCustomer({
          name: newName,
          phone: newPhone,
          vehicle: {
            registrationNumber: newRegNo,
            make: newMake,
            model: newModel,
            year: 2023,
          },
        });
        custId = createdCust.id;
        vehId = createdCust.vehicles[0].id;
      }

      if (!custId || !vehId) {
        alert('Please select or create both customer and vehicle.');
        setLoading(false);
        return;
      }

      const newJob = await api.createJobCard({
        customerId: custId,
        vehicleId: vehId,
        serviceType,
        customerConcerns: concerns,
        priority,
        estimatedCost: Number(estimatedCost) || 0,
      });

      onSuccess(newJob);
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Create New Job Card</h3>
              <p className="text-xs text-slate-500">Register vehicle service request</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center gap-4 text-xs font-semibold mb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="custType"
                checked={!isNewCustomer}
                onChange={() => setIsNewCustomer(false)}
                className="text-purple-600"
              />
              <span>Existing Customer</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="custType"
                checked={isNewCustomer}
                onChange={() => setIsNewCustomer(true)}
                className="text-purple-600"
              />
              <span>New Walk-in Customer</span>
            </label>
          </div>

          {!isNewCustomer ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Select Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    setSelectedVehicleId('');
                  }}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none"
                  required
                >
                  <option value="">Choose customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Select Vehicle</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none"
                  required
                >
                  <option value="">Choose vehicle...</option>
                  {selectedCustomer?.vehicles?.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} ({v.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Customer Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Anand Mahindra"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Registration #</label>
                  <input
                    type="text"
                    placeholder="MH-12-XX-0000"
                    value={newRegNo}
                    onChange={(e) => setNewRegNo(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Make</label>
                  <input
                    type="text"
                    value={newMake}
                    onChange={(e) => setNewMake(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Model</label>
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Service Package</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
              >
                <option value="Full Periodic Service">Full Periodic Service</option>
                <option value="Brake System Overhaul">Brake System Overhaul</option>
                <option value="Engine Diagnostics & Tune-up">Engine Diagnostics & Tune-up</option>
                <option value="AC Servicing & Gas Top-up">AC Servicing & Gas Top-up</option>
                <option value="Suspension & Steering Overhaul">Suspension & Steering Overhaul</option>
                <option value="Electrical & Battery Service">Electrical & Battery Service</option>
                <option value="Body Denting & Painting">Body Denting & Painting</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
              >
                <option value="NORMAL">Normal Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent (Express Delivery)</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Customer Reported Complaints / Notes</label>
            <textarea
              rows={2}
              placeholder="E.g., engine vibration above 80 km/h, brake squeal..."
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Initial Estimated Cost (₹)</label>
            <input
              type="number"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              {loading ? 'Creating...' : 'Create Job Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

