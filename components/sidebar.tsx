import { LayoutDashboard, Users, Folders, DollarSign, Settings, PieChart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, current: true },
  { name: 'Finance & Accounts', href: '#', icon: DollarSign, current: false },
  { name: 'Inventory & Orders', href: '#', icon: ShoppingCart, current: false },
  { name: 'Human Resources', href: '#', icon: Users, current: false },
  { name: 'Projects & CRM', href: '#', icon: Folders, current: false },
  { name: 'Report Builder', href: '/report-builder', icon: PieChart, current: false },
];

export function Sidebar() {
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center mt-2">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
              P
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Parsa ERP<span className="text-indigo-600 font-mono text-sm ml-1">v26</span></span>
          </div>
        </div>
        <nav className="flex flex-1 flex-col mt-4">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`
                        group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium
                        ${item.current 
                          ? 'bg-gray-50 text-indigo-600' 
                          : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'}
                      `}
                    >
                      <item.icon
                        className={`
                          h-6 w-6 shrink-0
                          ${item.current ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'}
                        `}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li className="mt-auto">
              <Link
                href="#"
                className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
              >
                <Settings className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-indigo-600" aria-hidden="true" />
                System Settings
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
