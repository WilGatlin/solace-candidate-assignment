"use client";

import { useState, useMemo } from "react";
import { debounce } from "@/utils/debounce"; 

export default function AdvocateTable({ initialAdvocates }) {
  const [filteredAdvocates, setFilteredAdvocates] = useState(initialAdvocates);
	
	const debouncedFilter = useMemo(
    () =>
      debounce((searchTerm) => {
        const filtered = initialAdvocates.filter((advocate) => {
          const fields = [
            advocate.firstName,
            advocate.lastName,
            advocate.city,
            advocate.degree,
            ...(advocate.specialties || []),
            advocate.yearsOfExperience.toString(),
          ].map((field) => field.toLowerCase());

          return fields.some((field) => field.includes(searchTerm));
        });

        setFilteredAdvocates(filtered);
      }, 300),
    [initialAdvocates] 
  );

	const onChange = (e) => {
    debouncedFilter(e.target.value.toLowerCase());
  };

  const onClick = () => {
    setFilteredAdvocates(initialAdvocates);
  };

  return (
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div>
        <p>Search</p>
        <input onChange={onChange} style={{ border: "1px solid black" }} />
        <p>
          Searching for: <span id="search-term"></span>
        </p>
        <button onClick={onClick}>Reset Search</button>
      </div>
      <br />
      <br />
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>City</th>
            <th>Degree</th>
            <th>Specialties</th>
            <th>Years of Experience</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {filteredAdvocates.map((advocate) => (
            <tr key={advocate.id}>
              <td>{advocate.firstName}</td>
              <td>{advocate.lastName}</td>
              <td>{advocate.city}</td>
              <td>{advocate.degree}</td>
              	<td>
                  {advocate.specialties.map((s,i) => (
                    <div key={`${advocate.id}-${s}-${i}`}>{s}</div>
                  ))}
              	</td>
              <td>{advocate.yearsOfExperience}</td>
              <td>{advocate.phoneNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
