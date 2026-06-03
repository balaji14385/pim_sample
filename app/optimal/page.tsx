"use client"
import { useState, useEffect } from 'react'

interface apiData {
  logo: string;
  brandName: string;
  parentBrandName?: string;
  brandCode: string;
  brandType: string;
  companyName: string;
  productCount: number;
  status: boolean;
  createdAt: string;
}

function Page() {
  const [brands, setBrands] = useState<apiData[]>([])

  useEffect(() => {
    async function display() {
      try {
        const res = await fetch("/api/registeredBrands");
        const data = await res.json();
        setBrands(data.data);
      } catch (error: any) {
        console.log(error)
      }
    }
    display();
  }, []);

  // Structural Grid Configuration: Adjust these widths to fit your design
  const gridLayout = {
    display: "grid",
    gridTemplateColumns: "50px 1fr 0.7fr 0.5fr 0.8fr 1.5fr 0.1fr 0.5fr 0.5fr 0.5fr 0.5fr ",
    alignItems: "center",
    gap: "3px",
    padding: "1px 1px"
  };

  const styles = {
    container: { padding: '24px', fontFamily: 'system-ui, sans-serif', color: '#1f2937' },
    gridWrapper: { border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    headerRow: { ...gridLayout, backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb', fontWeight: '600', fontSize: '14px' },
    dataRow: { ...gridLayout, borderBottom: '1px solid #e5e7eb', backgroundColor: '#ffffff', fontSize: '14px' },
    logoImg: { width: '45px', height: '45px', objectFit: 'cover' as const, borderRadius: '6px', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' },
    statusBadge: (status: boolean) => ({
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      textAlign: 'center' as const,
      display: 'inline-block',
      backgroundColor: status ? '#d1fae5' : '#fee2e2',
      color: status ? '#065f46' : '#991b1b'
    })
  };

  return (
    <div style={styles.container}>
      <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>Registered Brands</h2>
      
      {/* Grid Container acting as the "Table" */}
      <div style={styles.gridWrapper}>
        
        {/* Table Header Row */}
        <div style={styles.headerRow}>
          <div>Logo</div>
          <div>Brand Name</div>
          <div>Parent Brand</div>
          <div>Code</div>
          <div>Type</div>
          <div>Company Name</div>
          <div>Products</div>
          <div>Status</div>
          <div>edit</div>
          <div>edit</div>
          <div>edit</div>
        </div>

        {/* Table Body Rows */}
        {brands.map((brand, id) => (
          <div key={id} style={styles.dataRow}>
            
            {/* Logo Column */}
            <div>
              {brand.logo ? (
                <img src={brand.logo} alt={brand.brandName} style={styles.logoImg} />
              ) : (
                <div style={{...styles.logoImg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#9ca3af'}}>
                  No Logo
                </div>
              )}
            </div>
            
            {/* Structural Fields */}
            <div style={{ fontWeight: '500', color: '#111827' }}>{brand.brandName}</div>
            <div style={{ color: brand.parentBrandName ? '#1f2937' : '#9ca3af' }}>{brand.parentBrandName || "independent"}</div>
            <div><code>{brand.brandCode}</code></div>
            <div>{brand.brandType}</div>
            <div>{brand.companyName}</div>
            <div>{brand.productCount.toLocaleString()}</div>
            
            {/* Status Column */}
            <div>
              <span style={styles.statusBadge(brand.status)}>
                {brand.status ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            {/* Date Column */}
           <div>edit</div>
           <div>delete</div>
           <div>hjh</div>

          </div>
        ))}
      </div>
    </div>
  )
}

export default Page