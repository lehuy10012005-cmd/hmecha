"use client";

import { useEffect, useMemo, useState } from "react";

type Ward = {
  code: number;
  name: string;
};

type District = {
  code: number;
  name: string;
  wards?: Ward[];
};

type Province = {
  code: number;
  name: string;
  districts?: District[];
};

type CheckoutAddressPickerProps = {
  city: string;
  district: string;
  ward: string;
  onChange: (field: "city" | "district" | "ward", value: string) => void;
};

export default function CheckoutAddressPicker({
  city,
  district,
  ward,
  onChange,
}: CheckoutAddressPickerProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAddressData() {
      setLoading(true);

      try {
        const response = await fetch("https://provinces.open-api.vn/api/v1/?depth=3");
        const data = await response.json();

        setProvinces(Array.isArray(data) ? data : []);
      } catch {
        setProvinces([]);
      }

      setLoading(false);
    }

    loadAddressData();
  }, []);

  const selectedProvince = useMemo(() => {
    return provinces.find((province) => province.name === city);
  }, [city, provinces]);

  const districts = selectedProvince?.districts || [];

  const selectedDistrict = useMemo(() => {
    return districts.find((item) => item.name === district);
  }, [district, districts]);

  const wards = selectedDistrict?.wards || [];

  function handleCityChange(value: string) {
    onChange("city", value);

    const exactProvince = provinces.find((province) => province.name === value);

    if (exactProvince) {
      onChange("district", "");
      onChange("ward", "");
    }
  }

  function handleDistrictChange(value: string) {
    onChange("district", value);

    const exactDistrict = districts.find((item) => item.name === value);

    if (exactDistrict) {
      onChange("ward", "");
    }
  }

  return (
    <>
      <label>
        <span>Tỉnh / thành</span>
        <input
          value={city}
          onChange={(event) => handleCityChange(event.target.value)}
          list="hmecha-provinces"
          placeholder={loading ? "Đang tải tỉnh thành..." : "Gõ hoặc chọn tỉnh / thành"}
        />
        <datalist id="hmecha-provinces">
          {provinces.map((province) => (
            <option key={province.code} value={province.name} />
          ))}
        </datalist>
      </label>

      <label>
        <span>Quận / huyện</span>
        <input
          value={district}
          onChange={(event) => handleDistrictChange(event.target.value)}
          list="hmecha-districts"
          placeholder={city ? "Gõ hoặc chọn quận / huyện" : "Chọn tỉnh trước"}
        />
        <datalist id="hmecha-districts">
          {districts.map((item) => (
            <option key={item.code} value={item.name} />
          ))}
        </datalist>
      </label>

      <label>
        <span>Phường / xã</span>
        <input
          value={ward}
          onChange={(event) => onChange("ward", event.target.value)}
          list="hmecha-wards"
          placeholder={district ? "Gõ hoặc chọn phường / xã" : "Chọn quận trước"}
        />
        <datalist id="hmecha-wards">
          {wards.map((item) => (
            <option key={item.code} value={item.name} />
          ))}
        </datalist>
      </label>
    </>
  );
}