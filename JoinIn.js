"use client";
import React from "react";

import { useUpload } from "../utilities/runtime-helpers";

function MainComponent() {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Community Garden Day",
      type: "Volunteer",
      description: "Help maintain our neighborhood garden",
      mission: "Beautify our community spaces",
      location: "Main Street Garden",
      whatToBring: "Gardening gloves, water bottle",
      length: "3 hours",
      date: "2025-02-20",
      time: "09:00",
      image: "/garden-event.jpg",
      attendees: 12,
      distance: "0.4 miles",
      coordinates: { lat: 40.7138, lng: -74.006 },
    },
  ]);
  const [activeTab, setActiveTab] = useState("feed");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLocationField, setShowLocationField] = useState(false);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedMapEvent, setSelectedMapEvent] = useState(null);
  const [userPoints, setUserPoints] = useState(450);
  const [pointHistory, setPointHistory] = useState([
    { activity: "Completed help request", points: 50, date: "2025-03-15" },
    { activity: "Hosted community event", points: 200, date: "2025-03-10" },
    { activity: "Shared resource", points: 30, date: "2025-03-05" },
    { activity: "Daily check-in", points: 5, date: "2025-03-01" },
  ]);
  const [mapMarkers, setMapMarkers] = useState([
    {
      id: 1,
      type: "event",
      title: "Community Garden Day",
      description: "Help maintain our neighborhood garden",
      location: "Main Street Garden",
      date: "2025-02-20",
      time: "09:00",
      coordinates: { lat: 40.7128, lng: -74.006 },
    },
    {
      id: 2,
      type: "resource",
      title: "Power Tools Library",
      description: "Various power tools available for community use",
      location: "Workshop Center",
      coordinates: { lat: 40.7138, lng: -74.008 },
    },
    {
      id: 3,
      type: "help",
      title: "Senior Support Network",
      description: "Help seniors with daily tasks and companionship",
      location: "Community Center",
      coordinates: { lat: 40.7118, lng: -74.004 },
    },
  ]);
  const [displayedMapMarkers, setDisplayedMapMarkers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState("unverified");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationStep, setVerificationStep] = useState(1);
  const [verificationData, setVerificationData] = useState({
    idImage: null,
    selfieImage: null,
    proofOfResidence: null,
    phoneNumber: "",
    email: "",
    verificationCode: "",
  });
  const [upload, { loading: uploadLoading }] = useUpload();

  useEffect(() => {
    const allMarkers = [...mapMarkers];
    events.forEach((event) => {
      if (
        !allMarkers.find(
          (marker) => marker.type === "event" && marker.id === event.id
        )
      ) {
        allMarkers.push({
          id: event.id,
          type: "event",
          title: event.title,
          description: event.description,
          location: event.location,
          date: event.date,
          time: event.time,
          coordinates: event.coordinates || {
            lat: 40.7128 + Math.random() * 0.01,
            lng: -74.006 + Math.random() * 0.01,
          },
        });
      }
    });
    setMapMarkers(allMarkers);
    setDisplayedMapMarkers(allMarkers);
  }, [events, mapMarkers]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".location-search-container") &&
        !event.target.closest(".nearby-activities-container")
      ) {
        setLocationSuggestions([]);
        setDisplayedMapMarkers([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const handleLocationSearch = async (input) => {
    if (!input) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `/integrations/google-place-autocomplete/autocomplete/json?input=${encodeURIComponent(
          input
        )}&radius=500`
      );
      const data = await response.json();
      if (data.predictions) {
        setLocationSuggestions(data.predictions);
      }
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      setLocationSuggestions([]);
    }
  };
  const calculateNextMilestone = (points) => {
    const milestone = 500;
    const nextTarget = Math.ceil(points / milestone) * milestone;
    const progress = ((points % milestone) / milestone) * 100;
    const remaining = nextTarget - points;
    return { nextTarget, progress, remaining };
  };
  const handleLocationSelect = (location) => {
    setSearchLocation(location.description);
    setLocationSuggestions([]);
  };
  const handleClearMarkers = () => {
    setDisplayedMapMarkers([]);
    setSelectedMapEvent(null);
  };
  const handleFilterMarkers = (type) => {
    if (type === "all") {
      setDisplayedMapMarkers(mapMarkers);
    } else {
      const filtered = mapMarkers.filter((marker) => marker.type === type);
      setDisplayedMapMarkers(filtered);
    }
  };
  const [resourceFormData, setResourceFormData] = useState({
    name: "",
    category: "",
    description: "",
    location: "",
    requirements: "",
    phone: "",
    address: "",
    rentalType: "free",
    rentalPrice: "",
    image: null,
  });
  const [eventFormData, setEventFormData] = useState({
    title: "",
    type: "",
    description: "",
    mission: "",
    location: "",
    whatToBring: "",
    length: "",
    date: "",
    time: "",
    image: null,
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const handleRSVP = (eventId) => {
    setEvents(
      events.map((event) => {
        if (event.id === eventId) {
          return { ...event, attendees: event.attendees + 1 };
        }
        return event;
      })
    );
  };
  const handleEventSubmit = (e) => {
    e.preventDefault();
    const newEvent = {
      id: events.length + 1,
      ...eventFormData,
      attendees: 0,
      distance: "0.1 miles",
      coordinates: {
        lat: 40.7128 + Math.random() * 0.01,
        lng: -74.006 + Math.random() * 0.01,
      },
    };
    setEvents([newEvent, ...events]);
    setShowEventForm(false);
    setEventFormData({
      title: "",
      type: "",
      description: "",
      mission: "",
      location: "",
      whatToBring: "",
      length: "",
      date: "",
      time: "",
      image: null,
    });
  };
  const handleResourceSubmit = (e) => {
    e.preventDefault();
    const newResource = {
      id: resources.length + 1,
      ...resourceFormData,
      status: "Available",
      distance: "0.1 miles",
      owner: "John Doe",
    };
    setResources([newResource, ...resources]);
    setShowResourceForm(false);
    setResourceFormData({
      name: "",
      category: "",
      description: "",
      location: "",
      requirements: "",
      phone: "",
      address: "",
      rentalType: "free",
      rentalPrice: "",
      image: null,
    });
  };
  const [resources, setResources] = useState([
    {
      id: 1,
      name: "Power Drill",
      description: "Professional-grade power drill with multiple attachments",
      category: "Tools",
      status: "Available",
      image: "/power-drill.jpg",
      owner: "Mike Smith",
      distance: "0.3 miles",
      location: "Pine Street",
      requirements: "Valid ID required, $50 security deposit",
      rentalType: "free",
      phone: "555-0123",
    },
    {
      id: 2,
      name: "Camping Tent",
      description: "4-person tent, perfect for weekend camping trips",
      category: "Sports Equipment",
      status: "Available",
      image: "/tent.jpg",
      owner: "Sarah Johnson",
      distance: "0.8 miles",
      location: "Cedar Avenue",
      requirements: "Please clean before returning",
      rentalType: "paid",
      rentalPrice: "15",
      phone: "555-0124",
    },
  ]);
  const [requests, setRequests] = useState([
    {
      id: 1,
      type: "DIY Help",
      title: "Fix a leaky faucet",
      description: "Need help fixing a dripping kitchen faucet",
      location: "Oak Street",
      urgency: "Medium",
      timeRequired: "1-2 hours",
      date: "2025-02-15",
      status: "pending",
      distance: "0.5 miles",
    },
    {
      id: 2,
      type: "Borrowing",
      title: "Need a lawnmower",
      description: "Looking to borrow a lawnmower for weekend yard work",
      location: "Maple Avenue",
      urgency: "Low",
      timeRequired: "3 hours",
      date: "2025-02-16",
      status: "completed",
      distance: "1.2 miles",
    },
  ]);
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    shareLocation: false,
    resourceCategory: "",
    duration: "",
    conditionPreferences: "",
    deliveryPreference: "",
    budget: "",
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    const newRequest = {
      id: requests.length + 1,
      ...formData,
      date: new Date().toISOString().split("T")[0],
      status: "pending",
      distance: "0.1 miles",
    };
    setRequests([newRequest, ...requests]);
    setShowRequestForm(false);
    setFormData({
      type: "",
      title: "",
      description: "",
      location: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      shareLocation: false,
      resourceCategory: "",
      duration: "",
      conditionPreferences: "",
      deliveryPreference: "",
      budget: "",
    });
  };
  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    if (verificationStep === 1) {
      const { url: idUrl } = await upload({ file: verificationData.idImage });
      setVerificationData((prev) => ({ ...prev, idImageUrl: idUrl }));
      setVerificationStep(2);
    } else if (verificationStep === 2) {
      const { url: selfieUrl } = await upload({
        file: verificationData.selfieImage,
      });
      setVerificationData((prev) => ({ ...prev, selfieImageUrl: selfieUrl }));
      setVerificationStep(3);
    } else if (verificationStep === 3) {
      const { url: proofUrl } = await upload({
        file: verificationData.proofOfResidence,
      });
      setVerificationData((prev) => ({
        ...prev,
        proofOfResidenceUrl: proofUrl,
      }));
      setVerificationStep(4);
    } else if (verificationStep === 4) {
      setVerificationStatus("pending");
      setShowVerificationModal(false);
      setVerificationStep(1);
    }
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case "home":
        return (
          <div className="space-y-4">
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-block bg-[#E8F6FF] text-[#3498DB] text-sm px-2 py-1 rounded mb-2">
                        {request.type}
                      </span>
                      <h3 className="text-lg font-crimson-text mb-2">
                        {request.title}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {request.description}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>
                          <i className="fas fa-map-marker-alt mr-1"></i>
                          {request.location}
                        </span>
                        <span>
                          <i className="fas fa-clock mr-1"></i>
                          {request.timeRequired}
                        </span>
                        <span>
                          <i className="fas fa-calendar mr-1"></i>
                          {request.date}
                        </span>
                      </div>
                    </div>
                    <button className="bg-[#3498DB] text-white px-4 py-2 rounded hover:bg-[#2980B9] transition-colors">
                      Help Out
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "myrequests":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-4">
                <select className="p-2 border rounded-lg">
                  <option value="all">All Requests</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="declined">Declined</option>
                </select>
                <select className="p-2 border rounded-lg">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="distance">By Distance</option>
                </select>
              </div>
              <button className="text-[#3498DB]">
                <i className="fas fa-download mr-2"></i>Export History
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-lg shadow-md p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-[#E8F6FF] rounded-lg flex items-center justify-center text-[#3498DB] text-2xl">
                      <i
                        className={`fas ${
                          request.type === "DIY Help"
                            ? "fa-tools"
                            : "fa-hand-holding"
                        }`}
                      ></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-crimson-text">
                            {request.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {request.description}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-600">
                          Pending
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>
                          <i className="fas fa-calendar mr-1"></i>
                          {request.date}
                        </span>
                        <span>
                          <i className="fas fa-map-marker-alt mr-1"></i>
                          {request.location}
                        </span>
                        <span>
                          <i className="fas fa-clock mr-1"></i>
                          {request.timeRequired}
                        </span>
                        <span>
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          {request.urgency} Priority
                        </span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button className="px-3 py-1 text-sm rounded border border-[#3498DB] text-[#3498DB] hover:bg-[#E8F6FF]">
                          <i className="fas fa-eye mr-1"></i>View Details
                        </button>
                        <button className="px-3 py-1 text-sm rounded border border-[#3498DB] text-[#3498DB] hover:bg-[#E8F6FF]">
                          <i className="fas fa-comment mr-1"></i>Contact Helper
                        </button>
                        <button className="px-3 py-1 text-sm rounded border border-red-500 text-red-500 hover:bg-red-50">
                          <i className="fas fa-times mr-1"></i>Cancel Request
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "profile":
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-full md:w-1/3">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full bg-gray-200 mb-4 relative">
                      <img
                        src="/default-avatar.png"
                        alt="Profile picture"
                        className="w-full h-full rounded-full object-cover"
                      />
                      <button className="absolute bottom-0 right-0 bg-[#3498DB] text-white p-2 rounded-full">
                        <i className="fas fa-camera"></i>
                      </button>
                    </div>
                    <h3 className="text-xl font-crimson-text mb-2">John Doe</h3>
                    <p className="text-gray-600 text-center mb-4">
                      Helping neighbors since 2024
                    </p>
                    <div className="flex gap-2 mb-4">
                      <span className="bg-[#E8F6FF] text-[#3498DB] px-3 py-1 rounded-full text-sm">
                        DIY Expert
                      </span>
                      <span className="bg-[#E8F6FF] text-[#3498DB] px-3 py-1 rounded-full text-sm">
                        Pet Care
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-2/3 space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-crimson-text mb-4">About Me</h3>
                  <textarea
                    className="w-full p-3 border rounded-lg"
                    rows="4"
                    placeholder="Tell your neighbors about yourself..."
                  ></textarea>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-crimson-text mb-4">
                    Skills & Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                      Gardening
                    </span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                      Home Repair
                    </span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                      Cooking
                    </span>
                    <button className="text-[#3498DB]">
                      <i className="fas fa-plus mr-1"></i>Add More
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-crimson-text mb-4">
                Activity History
              </h3>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-crimson-text">
                        Helped with garden maintenance
                      </h4>
                      <p className="text-gray-600">
                        Assisted Sarah with spring garden cleanup
                      </p>
                      <span className="text-sm text-gray-500">
                        March 15, 2025
                      </span>
                    </div>
                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm">
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "leaderboard":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-crimson-text mb-6">
                Top Helpers This Month
              </h3>
              <div className="space-y-4">
                {[
                  {
                    name: "Sarah Johnson",
                    points: 150,
                    tasks: 12,
                    badge: "🏆",
                  },
                  { name: "Michael Chen", points: 120, tasks: 10, badge: "🥈" },
                  { name: "Emma Davis", points: 90, tasks: 8, badge: "🥉" },
                ].map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{user.badge}</span>
                      <div>
                        <h4 className="font-crimson-text">{user.name}</h4>
                        <p className="text-sm text-gray-600">
                          {user.tasks} tasks completed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-crimson-text text-[#3498DB]">
                        {user.points}
                      </span>
                      <p className="text-sm text-gray-600">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-crimson-text mb-4">Your Ranking</h3>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-[#E8F6FF]">
                <div className="flex items-center gap-4">
                  <span className="text-xl">15</span>
                  <div>
                    <h4 className="font-crimson-text">Your Position</h4>
                    <p className="text-sm text-gray-600">5 tasks completed</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-crimson-text text-[#3498DB]">
                    45
                  </span>
                  <p className="text-sm text-gray-600">points</p>
                </div>
              </div>
            </div>
          </div>
        );
      case "resources":
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="w-full md:w-1/4">
                <input
                  type="text"
                  placeholder="Search resources..."
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="w-full md:w-1/4">
                <select className="w-full p-2 border rounded-lg">
                  <option value="">All Categories</option>
                  <option value="Tools">Tools</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Appliances">Appliances</option>
                  <option value="Electronics">Electronics</option>
                </select>
              </div>
              <div className="w-full md:w-1/4">
                <select className="w-full p-2 border rounded-lg">
                  <option value="">All Availabilities</option>
                  <option value="Available">Available Now</option>
                  <option value="Coming Soon">Coming Soon</option>
                </select>
              </div>
              <div className="w-full md:w-1/4">
                <button
                  onClick={() => setShowResourceForm(true)}
                  className="w-full bg-[#3498DB] text-white px-4 py-2 rounded-lg hover:bg-[#2980B9] transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Offer Resource
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                  onClick={() => setSelectedResource(resource)}
                >
                  <div className="h-48 bg-gray-200">
                    <img
                      src={resource.image}
                      alt={`${resource.name} available for sharing`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-crimson-text">
                        {resource.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          resource.status === "Available"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {resource.status}
                      </span>
                    </div>
                    <span className="inline-block bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded mb-2">
                      {resource.category}
                    </span>
                    <p className="text-gray-600 text-sm mb-4">
                      {resource.description}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <span>
                        <i className="fas fa-map-marker-alt mr-1"></i>
                        {resource.distance}
                      </span>
                      <span>
                        <i className="fas fa-user mr-1"></i>
                        {resource.owner}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedResource(resource);
                        }}
                        className="flex-1 bg-[#3498DB] text-white px-4 py-2 rounded hover:bg-[#2980B9] transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {showResourceForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pt-2">
                    <h2 className="text-xl font-crimson-text">
                      Offer Resource
                    </h2>
                    <button onClick={() => setShowResourceForm(false)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <form onSubmit={handleResourceSubmit}>
                    <input
                      name="name"
                      type="text"
                      placeholder="Resource Name"
                      className="w-full mb-4 p-2 border rounded"
                      value={resourceFormData.name}
                      onChange={(e) =>
                        setResourceFormData({
                          ...resourceFormData,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                    <select
                      name="category"
                      className="w-full mb-4 p-2 border rounded"
                      value={resourceFormData.category}
                      onChange={(e) =>
                        setResourceFormData({
                          ...resourceFormData,
                          category: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Tools">Tools</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Appliances">Appliances</option>
                      <option value="Electronics">Electronics</option>
                    </select>
                    <textarea
                      name="description"
                      placeholder="Description"
                      className="w-full mb-4 p-2 border rounded"
                      value={resourceFormData.description}
                      onChange={(e) =>
                        setResourceFormData({
                          ...resourceFormData,
                          description: e.target.value,
                        })
                      }
                      required
                    ></textarea>
                    <input
                      name="location"
                      type="text"
                      placeholder="Location"
                      className="w-full mb-4 p-2 border rounded"
                      value={resourceFormData.location}
                      onChange={(e) =>
                        setResourceFormData({
                          ...resourceFormData,
                          location: e.target.value,
                        })
                      }
                      required
                    />
                    <textarea
                      name="requirements"
                      placeholder="Requirements (e.g., Valid ID, Security Deposit)"
                      className="w-full mb-4 p-2 border rounded"
                      value={resourceFormData.requirements}
                      onChange={(e) =>
                        setResourceFormData({
                          ...resourceFormData,
                          requirements: e.target.value,
                        })
                      }
                    ></textarea>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="Phone Number (Optional)"
                      className="w-full mb-4 p-2 border rounded"
                      value={resourceFormData.phone}
                      onChange={(e) =>
                        setResourceFormData({
                          ...resourceFormData,
                          phone: e.target.value,
                        })
                      }
                    />
                    <input
                      name="address"
                      type="text"
                      placeholder="Address (Optional)"
                      className="w-full mb-4 p-2 border rounded"
                      value={resourceFormData.address}
                      onChange={(e) =>
                        setResourceFormData({
                          ...resourceFormData,
                          address: e.target.value,
                        })
                      }
                    />
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Rental Type
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="rentalType"
                            value="free"
                            checked={resourceFormData.rentalType === "free"}
                            onChange={(e) =>
                              setResourceFormData({
                                ...resourceFormData,
                                rentalType: e.target.value,
                                rentalPrice: "",
                              })
                            }
                            className="mr-2"
                          />
                          Free to Borrow
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="rentalType"
                            value="paid"
                            checked={resourceFormData.rentalType === "paid"}
                            onChange={(e) =>
                              setResourceFormData({
                                ...resourceFormData,
                                rentalType: e.target.value,
                              })
                            }
                            className="mr-2"
                          />
                          Paid Rental
                        </label>
                      </div>
                    </div>
                    {resourceFormData.rentalType === "paid" && (
                      <input
                        name="rentalPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Rental Price per Day ($)"
                        className="w-full mb-4 p-2 border rounded"
                        value={resourceFormData.rentalPrice}
                        onChange={(e) =>
                          setResourceFormData({
                            ...resourceFormData,
                            rentalPrice: e.target.value,
                          })
                        }
                        required
                      />
                    )}
                    <input
                      name="image"
                      type="file"
                      accept="image/*"
                      className="w-full mb-4 p-2 border rounded"
                      onChange={(e) =>
                        setResourceFormData({
                          ...resourceFormData,
                          image: e.target.files[0],
                        })
                      }
                      required
                    />
                    <div className="sticky bottom-0 bg-white pt-4">
                      <button
                        type="submit"
                        className="w-full bg-[#3498DB] text-white py-2 rounded hover:bg-[#2980B9] transition-colors"
                      >
                        Offer Resource
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {selectedResource && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-start mb-4 sticky top-0 bg-white pt-2">
                    <h2 className="text-2xl font-crimson-text">
                      {selectedResource.name}
                    </h2>
                    <button onClick={() => setSelectedResource(null)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <img
                        src={selectedResource.image}
                        alt={`${selectedResource.name} details`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="mt-4">
                        <h3 className="font-crimson-text text-lg mb-2">
                          Resource Details
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {selectedResource.description}
                        </p>
                        <div className="space-y-2 text-sm text-gray-500">
                          <p>
                            <i className="fas fa-map-marker-alt mr-2"></i>
                            {selectedResource.location} (
                            {selectedResource.distance} away)
                          </p>
                          <p>
                            <i className="fas fa-user mr-2"></i>
                            Owner: {selectedResource.owner}
                          </p>
                          {selectedResource.phone && (
                            <p>
                              <i className="fas fa-phone mr-2"></i>
                              {selectedResource.phone}
                            </p>
                          )}
                          {selectedResource.address && (
                            <p>
                              <i className="fas fa-map-marker-alt mr-2"></i>
                              {selectedResource.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="mb-6">
                        <h3 className="font-crimson-text text-lg mb-2">
                          Requirements
                        </h3>
                        <p className="text-gray-600">
                          {selectedResource.requirements}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-crimson-text text-lg mb-2">
                          Rental Information
                        </h3>
                        <p className="text-gray-600">
                          {selectedResource.rentalType === "free" ? (
                            <span>
                              <i className="fas fa-heart mr-2"></i>
                              Free to borrow
                            </span>
                          ) : (
                            <span>
                              <i className="fas fa-dollar-sign mr-2"></i>$
                              {selectedResource.rentalPrice} per day
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="mt-6 flex gap-4">
                        <button
                          onClick={() => setSelectedResource(null)}
                          className="flex-1 bg-[#3498DB] text-white px-4 py-2 rounded hover:bg-[#2980B9] transition-colors"
                        >
                          Request to Rent
                        </button>
                        <button
                          onClick={() => setSelectedResource(null)}
                          className="flex-1 border border-[#3498DB] text-[#3498DB] px-4 py-2 rounded hover:bg-[#E8F6FF] transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case "events":
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="w-full md:w-1/3">
                <input
                  type="text"
                  placeholder="Search events..."
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="w-full md:w-1/3">
                <select className="w-full p-2 border rounded-lg">
                  <option value="">All Event Types</option>
                  <option value="Social">Social</option>
                  <option value="Volunteer">Volunteer</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>
              <div className="w-full md:w-1/3">
                <select className="w-full p-2 border rounded-lg">
                  <option value="">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
              <div className="w-full md:w-1/3">
                <button
                  onClick={() => setShowEventForm(true)}
                  className="w-full bg-[#3498DB] text-white px-4 py-2 rounded-lg hover:bg-[#2980B9] transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Create Event
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="h-48 bg-gray-200">
                    <img
                      src={event.image}
                      alt={`${event.title} event banner`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-crimson-text">
                        {event.title}
                      </h3>
                      <span className="bg-[#E8F6FF] text-[#3498DB] text-sm px-2 py-1 rounded">
                        {event.type}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      {event.description}
                    </p>
                    <div className="flex flex-col gap-2 text-sm text-gray-500 mb-4">
                      <span>
                        <i className="fas fa-calendar mr-2"></i>
                        {event.date} at {event.time}
                      </span>
                      <span>
                        <i className="fas fa-map-marker-alt mr-2"></i>
                        {event.location} ({event.distance} away)
                      </span>
                      <span>
                        <i className="fas fa-clock mr-2"></i>
                        {event.length}
                      </span>
                      <span>
                        <i className="fas fa-users mr-2"></i>
                        {event.attendees} attending
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRSVP(event.id);
                        }}
                        className="flex-1 bg-[#3498DB] text-white px-4 py-2 rounded hover:bg-[#2980B9] transition-colors"
                      >
                        RSVP
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="flex-1 border border-[#3498DB] text-[#3498DB] px-4 py-2 rounded hover:bg-[#E8F6FF] transition-colors"
                      >
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {showEventForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pt-2">
                    <h2 className="text-xl font-crimson-text">Create Event</h2>
                    <button onClick={() => setShowEventForm(false)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <form onSubmit={handleEventSubmit}>
                    <input
                      name="title"
                      type="text"
                      placeholder="Event Title"
                      className="w-full mb-4 p-2 border rounded"
                      value={eventFormData.title}
                      onChange={(e) =>
                        setEventFormData({
                          ...eventFormData,
                          title: e.target.value,
                        })
                      }
                      required
                    />
                    <select
                      name="type"
                      className="w-full mb-4 p-2 border rounded"
                      value={eventFormData.type}
                      onChange={(e) =>
                        setEventFormData({
                          ...eventFormData,
                          type: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select Event Type</option>
                      <option value="Social">Social</option>
                      <option value="Volunteer">Volunteer</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Sports">Sports</option>
                    </select>
                    <textarea
                      name="description"
                      placeholder="Event Description"
                      className="w-full mb-4 p-2 border rounded"
                      value={eventFormData.description}
                      onChange={(e) =>
                        setEventFormData({
                          ...eventFormData,
                          description: e.target.value,
                        })
                      }
                      required
                    ></textarea>
                    <textarea
                      name="mission"
                      placeholder="Event Mission (Optional)"
                      className="w-full mb-4 p-2 border rounded"
                      value={eventFormData.mission}
                      onChange={(e) =>
                        setEventFormData({
                          ...eventFormData,
                          mission: e.target.value,
                        })
                      }
                    ></textarea>
                    <input
                      name="location"
                      type="text"
                      placeholder="Event Location"
                      className="w-full mb-4 p-2 border rounded"
                      value={eventFormData.location}
                      onChange={(e) =>
                        setEventFormData({
                          ...eventFormData,
                          location: e.target.value,
                        })
                      }
                      required
                    />
                    <textarea
                      name="whatToBring"
                      placeholder="What to Bring"
                      className="w-full mb-4 p-2 border rounded"
                      value={eventFormData.whatToBring}
                      onChange={(e) =>
                        setEventFormData({
                          ...eventFormData,
                          whatToBring: e.target.value,
                        })
                      }
                      required
                    ></textarea>
                    <input
                      name="length"
                      type="text"
                      placeholder="Event Length (e.g. 2 hours)"
                      className="w-full mb-4 p-2 border rounded"
                      value={eventFormData.length}
                      onChange={(e) =>
                        setEventFormData({
                          ...eventFormData,
                          length: e.target.value,
                        })
                      }
                      required
                    />
                    <input
                      name="date"
                      type="date"
                      className="w-full mb-4 p-2 border rounded"
                      value={eventFormData.date}
                      onChange={(e) =>
                        setEventFormData({
                          ...eventFormData,
                          date: e.target.value,
                        })
                      }
                      required
                    />
                    <input
                      name="time"
                      type="time"
                      className="w-full mb-4 p-2 border rounded"
                      value={eventFormData.time}
                      onChange={(e) =>
                        setEventFormData({
                          ...eventFormData,
                          time: e.target.value,
                        })
                      }
                      required
                    />
                    <input
                      name="image"
                      type="file"
                      accept="image/*"
                      className="w-full mb-4 p-2 border rounded"
                      onChange={(e) =>
                        setEventFormData({
                          ...eventFormData,
                          image: e.target.files[0],
                        })
                      }
                      required
                    />
                    <div className="sticky bottom-0 bg-white pt-4">
                      <button
                        type="submit"
                        className="w-full bg-[#3498DB] text-white py-2 rounded hover:bg-[#2980B9] transition-colors"
                      >
                        Create Event
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {selectedEvent && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-start mb-4 sticky top-0 bg-white pt-2">
                    <h2 className="text-2xl font-crimson-text">
                      {selectedEvent.title}
                    </h2>
                    <button onClick={() => setSelectedEvent(null)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <img
                        src={selectedEvent.image}
                        alt={`${selectedEvent.title} event details`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="mt-4">
                        <h3 className="font-crimson-text text-lg mb-2">
                          Event Details
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {selectedEvent.description}
                        </p>
                        <div className="space-y-2 text-sm text-gray-500">
                          <p>
                            <i className="fas fa-calendar mr-2"></i>
                            {selectedEvent.date} at {selectedEvent.time}
                          </p>
                          <p>
                            <i className="fas fa-map-marker-alt mr-2"></i>
                            {selectedEvent.location}
                          </p>
                          <p>
                            <i className="fas fa-clock mr-2"></i>
                            {selectedEvent.length}
                          </p>
                          <p>
                            <i className="fas fa-users mr-2"></i>
                            {selectedEvent.attendees} attending
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      {selectedEvent.mission && (
                        <div className="mb-6">
                          <h3 className="font-crimson-text text-lg mb-2">
                            Mission
                          </h3>
                          <p className="text-gray-600">
                            {selectedEvent.mission}
                          </p>
                        </div>
                      )}
                      <div>
                        <h3 className="font-crimson-text text-lg mb-2">
                          What to Bring
                        </h3>
                        <p className="text-gray-600">
                          {selectedEvent.whatToBring}
                        </p>
                      </div>
                      <div className="mt-6 flex gap-4">
                        <button
                          onClick={() => {
                            handleRSVP(selectedEvent.id);
                            setSelectedEvent(null);
                          }}
                          className="flex-1 bg-[#3498DB] text-white px-4 py-2 rounded hover:bg-[#2980B9] transition-colors"
                        >
                          RSVP
                        </button>
                        <button
                          onClick={() => setSelectedEvent(null)}
                          className="flex-1 border border-[#3498DB] text-[#3498DB] px-4 py-2 rounded hover:bg-[#E8F6FF] transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case "notifications":
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Notifications coming soon</p>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gray-200 relative">
                  <img
                    src="/default-avatar.png"
                    alt="User profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                  <div className="absolute -top-1 -right-1">
                    <span className="bg-green-500 p-1 rounded-full">
                      <i className="fas fa-check text-white text-xs"></i>
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-crimson-text">John Doe</h3>
                  <p className="text-gray-600 text-sm">john.doe@example.com</p>
                  <p className="text-gray-600 text-sm">+1 (555) 123-4567</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Last login: March 15, 2025 from iPhone
                  </p>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      className="w-full p-2 border rounded-lg"
                      defaultValue="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      className="w-full p-2 border rounded-lg"
                      defaultValue="johndoe"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-crimson-text mb-4">
                Security Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center">
                    <input type="checkbox" name="twoFactor" className="mr-2" />
                    <label className="text-sm text-gray-700">
                      Enable Two-Factor Authentication
                    </label>
                  </div>
                  <button className="text-[#3498DB] text-sm">
                    Manage Devices
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-crimson-text mb-4">
                Privacy Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Profile Visibility</p>
                    <p className="text-sm text-gray-600">
                      Control who can see your profile
                    </p>
                  </div>
                  <select
                    name="profileVisibility"
                    className="p-2 border rounded-lg"
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Location Services</p>
                    <p className="text-sm text-gray-600">
                      Show your location to others
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      name="locationServices"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3498DB]"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-crimson-text mb-4">Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-600">
                      Receive alerts on your device
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      name="pushNotifications"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3498DB]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Updates</p>
                    <p className="text-sm text-gray-600">
                      Receive email notifications
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      name="emailUpdates"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3498DB]"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-crimson-text mb-4">
                Account Actions
              </h3>
              <div className="space-y-4">
                <button className="w-full p-2 border border-[#3498DB] text-[#3498DB] rounded-lg hover:bg-[#E8F6FF] transition-colors">
                  Download My Data
                </button>
                <button className="w-full p-2 border border-yellow-500 text-yellow-500 rounded-lg hover:bg-yellow-50 transition-colors">
                  Deactivate Account
                </button>
                <button className="w-full p-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        );
      case "rewards":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-crimson-text mb-2">
                    Your Points
                  </h3>
                  <p className="text-3xl font-crimson-text text-[#3498DB]">
                    {userPoints}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Next Milestone</p>
                  <p className="font-crimson-text">
                    {calculateNextMilestone(userPoints).nextTarget} points
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-[#3498DB] h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${calculateNextMilestone(userPoints).progress}%`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                {calculateNextMilestone(userPoints).remaining} points until next
                milestone
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-crimson-text mb-6">
                Available Rewards
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    name: "Free Resource Rental",
                    points: 100,
                    icon: "fas fa-box",
                  },
                  {
                    name: "Priority Request",
                    points: 200,
                    icon: "fas fa-star",
                  },
                  {
                    name: "Community Badge",
                    points: 300,
                    icon: "fas fa-award",
                  },
                  {
                    name: "Featured Helper Status",
                    points: 500,
                    icon: "fas fa-crown",
                  },
                  {
                    name: "Custom Profile Theme",
                    points: 400,
                    icon: "fas fa-palette",
                  },
                  {
                    name: "Event Host Badge",
                    points: 600,
                    icon: "fas fa-certificate",
                  },
                ].map((reward, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-[#E8F6FF] rounded-full flex items-center justify-center text-[#3498DB]">
                        <i className={`${reward.icon} text-xl`}></i>
                      </div>
                      <span className="font-crimson-text text-lg">
                        {reward.points} pts
                      </span>
                    </div>
                    <h4 className="font-crimson-text mb-2">{reward.name}</h4>
                    <button
                      className={`w-full py-2 rounded ${
                        userPoints >= reward.points
                          ? "bg-[#3498DB] text-white hover:bg-[#2980B9]"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      } transition-colors`}
                      disabled={userPoints < reward.points}
                    >
                      {userPoints >= reward.points
                        ? "Redeem"
                        : "Not Enough Points"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-crimson-text mb-4">Points History</h3>
              <div className="space-y-4">
                {pointHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-4"
                  >
                    <div>
                      <p className="font-crimson-text">{entry.activity}</p>
                      <p className="text-sm text-gray-500">{entry.date}</p>
                    </div>
                    <span className="text-[#3498DB] font-crimson-text">
                      +{entry.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "opportunities":
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="w-full md:w-1/3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by location..."
                    className="w-full p-2 border rounded-lg"
                    value={searchLocation}
                    onChange={(e) => {
                      setSearchLocation(e.target.value);
                      handleLocationSearch(e.target.value);
                    }}
                  />
                  {locationSuggestions.length > 0 && (
                    <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg z-50">
                      {locationSuggestions.map((location) => (
                        <div
                          key={location.place_id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleLocationSelect(location)}
                        >
                          {location.description}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full md:w-1/3">
                <select className="w-full p-2 border rounded-lg">
                  <option value="">All Categories</option>
                  <option value="elderly">Elderly Support</option>
                  <option value="childcare">Childcare</option>
                  <option value="tutoring">Tutoring</option>
                  <option value="maintenance">Home Maintenance</option>
                  <option value="transportation">Transportation</option>
                </select>
              </div>
              <div className="w-full md:w-1/3">
                <select className="w-full p-2 border rounded-lg">
                  <option value="">All Time Commitments</option>
                  <option value="oneTime">One-time</option>
                  <option value="recurring">Recurring</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  id: 1,
                  title: "Senior Companion Needed",
                  category: "Elderly Support",
                  description:
                    "Looking for someone to spend time with my elderly mother, engage in conversation and light activities.",
                  commitment: "Recurring",
                  location: "Oak Street",
                  timeNeeded: "2-3 hours/week",
                  postedDate: "2025-03-15",
                  urgency: "Medium",
                  pointsOffered: 50,
                },
                {
                  id: 2,
                  title: "Math Tutoring for Middle School Student",
                  category: "Tutoring",
                  description:
                    "Need help with 8th grade algebra and geometry. Student is eager to learn but struggling with core concepts.",
                  commitment: "Recurring",
                  location: "Maple Avenue",
                  timeNeeded: "1 hour/week",
                  postedDate: "2025-03-14",
                  urgency: "Low",
                  pointsOffered: 30,
                },
                {
                  id: 3,
                  title: "Garden Cleanup Assistance",
                  category: "Home Maintenance",
                  description:
                    "Need help clearing winter debris and preparing garden beds for spring planting.",
                  commitment: "One-time",
                  location: "Pine Street",
                  timeNeeded: "4-5 hours",
                  postedDate: "2025-03-13",
                  urgency: "High",
                  pointsOffered: 75,
                },
              ].map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-crimson-text">
                        {opportunity.title}
                      </h3>
                      <span className="bg-[#E8F6FF] text-[#3498DB] text-sm px-2 py-1 rounded">
                        {opportunity.category}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      {opportunity.description}
                    </p>
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div>
                        <i className="fas fa-clock mr-2"></i>
                        {opportunity.timeNeeded}
                      </div>
                      <div>
                        <i className="fas fa-map-marker-alt mr-2"></i>
                        {opportunity.location}
                      </div>
                      <div>
                        <i className="fas fa-calendar-alt mr-2"></i>
                        Posted on {opportunity.postedDate}
                      </div>
                      <div>
                        <i className="fas fa-gift mr-2"></i>
                        {opportunity.pointsOffered} points
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-[#3498DB] text-white px-4 py-2 rounded hover:bg-[#2980B9] transition-colors">
                        Volunteer
                      </button>
                      <button className="flex-1 border border-[#3498DB] text-[#3498DB] px-4 py-2 rounded hover:bg-[#E8F6FF] transition-colors">
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Page under construction</p>
          </div>
        );
    }
  };

  const handleEventClick = (event) => {
    setSelectedMapEvent(event);
  };
  const renderMapContent = () => {
    return (
      <div className="h-[600px] relative rounded-lg overflow-hidden">
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFilterMarkers("event");
            }}
            className="bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <i className="fas fa-calendar-alt mr-2"></i>Events
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFilterMarkers("resource");
            }}
            className="bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <i className="fas fa-box-open mr-2"></i>Resources
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFilterMarkers("help");
            }}
            className="bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <i className="fas fa-hands-helping mr-2"></i>Help Requests
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFilterMarkers("all");
            }}
            className="bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <i className="fas fa-globe mr-2"></i>Show All
          </button>
          <div className="flex-1 min-w-[200px] relative location-search-container">
            <input
              type="text"
              placeholder="Search location..."
              className="w-full px-4 py-2 rounded-lg shadow-md"
              value={searchLocation}
              onChange={(e) => {
                setSearchLocation(e.target.value);
                handleLocationSearch(e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
            />
            {locationSuggestions.length > 0 && (
              <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg z-50">
                {locationSuggestions.map((location) => (
                  <div
                    key={location.place_id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLocationSelect(location);
                    }}
                  >
                    {location.description}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {displayedMapMarkers.length > 0 && (
          <div className="absolute right-4 top-20 z-10 bg-white rounded-lg shadow-lg p-4 max-w-sm w-full nearby-activities-container">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-crimson-text text-lg">Nearby Activities</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearMarkers();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {displayedMapMarkers.map((marker) => (
                <div
                  key={marker.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedMapEvent?.id === marker.id
                      ? "bg-[#E8F6FF] border-2 border-[#3498DB]"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(marker);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[#E8F6FF] flex items-center justify-center text-[#3498DB]">
                      <i
                        className={`fas ${
                          marker.type === "event"
                            ? "fa-calendar"
                            : marker.type === "resource"
                            ? "fa-box"
                            : "fa-hands-helping"
                        }`}
                      ></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-crimson-text text-sm">
                        {marker.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        <i className="fas fa-map-marker-alt mr-1"></i>
                        {marker.location}
                      </p>
                      {marker.date && (
                        <p className="text-xs text-gray-500">
                          <i className="fas fa-calendar-alt mr-1"></i>
                          {marker.date} at {marker.time}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="absolute bottom-4 right-4 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (userLocation) {
                const map = document.querySelector("iframe");
                if (map) {
                  map.src = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d19868.687835939456!2d${userLocation.lng}!3d${userLocation.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1629291764270!5m2!1sen!2sus`;
                }
              }
            }}
            className="bg-white p-3 rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            <i className="fas fa-location-arrow"></i>
          </button>
        </div>

        {selectedMapEvent && !displayedMapMarkers.length && (
          <div
            className="absolute left-4 bottom-4 z-20 bg-white rounded-lg shadow-lg p-4 max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-crimson-text">{selectedMapEvent.title}</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMapEvent(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {selectedMapEvent.description}
            </p>
            <div className="flex gap-2">
              {selectedMapEvent.type === "event" ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRSVP(selectedMapEvent.id);
                      setSelectedEvent(selectedMapEvent);
                      setCurrentPage("events");
                    }}
                    className="flex-1 bg-[#3498DB] text-white px-3 py-1 rounded text-sm hover:bg-[#2980B9] transition-colors"
                  >
                    RSVP
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(selectedMapEvent);
                      setCurrentPage("events");
                    }}
                    className="flex-1 border border-[#3498DB] text-[#3498DB] px-3 py-1 rounded text-sm hover:bg-[#E8F6FF] transition-colors"
                  >
                    View Details
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPage(
                      selectedMapEvent.type === "resource"
                        ? "resources"
                        : "myrequests"
                    );
                  }}
                  className="flex-1 bg-[#3498DB] text-white px-3 py-1 rounded text-sm hover:bg-[#2980B9] transition-colors"
                >
                  Learn More
                </button>
              )}
            </div>
          </div>
        )}

        <iframe
          src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d19868.687835939456!2d${
            userLocation ? userLocation.lng : -74.00597399999999
          }!3d${
            userLocation ? userLocation.lat : 40.7127837
          }!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1629291764270!5m2!1sen!2sus`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0"
        ></iframe>

        {!displayedMapMarkers.length &&
          mapMarkers.map((marker) => (
            <div
              key={marker.id}
              className="absolute z-20"
              style={{
                left: `${((marker.coordinates.lng + 180) / 360) * 100}%`,
                top: `${((90 - marker.coordinates.lat) / 180) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(marker);
                  }}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <i
                    className={`fas ${
                      marker.type === "event"
                        ? "fa-calendar"
                        : marker.type === "resource"
                        ? "fa-box"
                        : "fa-hands-helping"
                    }`}
                  ></i>
                </button>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#3498DB] rounded-full border-2 border-white"></div>
                <div className="absolute w-8 h-8 -top-4 -left-4 border-2 border-[#3498DB] rounded-full animate-pulse"></div>
              </div>
            </div>
          ))}
      </div>
    );
  };

  const menuItems = [
    { name: "home", icon: "fas fa-home", label: "Home" },
    { name: "myrequests", icon: "fas fa-list", label: "My Requests" },
    {
      name: "opportunities",
      icon: "fas fa-hand-helping",
      label: "Help Opportunities",
    },
    { name: "resources", icon: "fas fa-share-alt", label: "Resource Sharing" },
    { name: "notifications", icon: "fas fa-bell", label: "Notifications" },
    { name: "profile", icon: "fas fa-user", label: "Profile" },
    { name: "events", icon: "fas fa-calendar", label: "Community Events" },
    { name: "leaderboard", icon: "fas fa-trophy", label: "Leaderboard" },
    { name: "rewards", icon: "fas fa-gift", label: "Rewards" },
    { name: "settings", icon: "fas fa-cog", label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div
        className={`${
          showMobileMenu ? "block" : "hidden"
        } md:block fixed md:relative w-64 bg-white shadow-lg h-full z-50`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-crimson-text text-[#2C3E50]">
              JoinIn
            </h1>
            <button
              onClick={() => setShowMobileMenu(false)}
              className="md:hidden"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <NewComponent
            items={menuItems}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            setShowMobileMenu={setShowMobileMenu}
          />
        </div>
      </div>
      <div className="flex-1 p-4" onClick={() => setShowMobileMenu(false)}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMobileMenu(!showMobileMenu);
                }}
                className="md:hidden text-2xl"
              >
                <i className="fas fa-bars"></i>
              </button>
              <h2 className="text-2xl font-crimson-text text-[#2C3E50]">
                {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              {verificationStatus === "unverified" && (
                <button
                  onClick={() => setShowVerificationModal(true)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <i className="fas fa-shield-alt mr-2"></i>
                  Verify Account
                </button>
              )}
              <button
                onClick={() => setShowRequestForm(true)}
                className="bg-[#3498DB] text-white px-4 py-2 rounded-lg hover:bg-[#2980B9] transition-colors"
                disabled={verificationStatus === "unverified"}
              >
                <i className="fas fa-plus mr-2"></i>
                Ask for Help
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            {verificationStatus === "unverified" && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-exclamation-triangle text-yellow-400"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Your account needs to be verified to access all features.
                      <button
                        onClick={() => setShowVerificationModal(true)}
                        className="ml-2 font-medium underline"
                      >
                        Verify now
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab("feed")}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === "feed"
                    ? "bg-[#3498DB] text-white"
                    : "bg-gray-200"
                }`}
              >
                <i className="fas fa-stream mr-2"></i>Feed
              </button>
              <button
                onClick={() => setActiveTab("map")}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === "map"
                    ? "bg-[#3498DB] text-white"
                    : "bg-gray-200"
                }`}
              >
                <i className="fas fa-map-marker-alt mr-2"></i>Map
              </button>
            </div>

            {activeTab === "map" ? renderMapContent() : renderPageContent()}

            {showRequestForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-crimson-text">
                      Create Request
                    </h2>
                    <button onClick={() => setShowRequestForm(false)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <input
                      name="name"
                      type="text"
                      placeholder="Your Name"
                      className="w-full mb-4 p-2 border rounded"
                      required
                    />

                    <select
                      name="category"
                      className="w-full mb-4 p-2 border rounded"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="DIY Help">DIY Help</option>
                      <option value="Borrowing">Borrowing</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Tutoring">Tutoring</option>
                      <option value="Pet Care">Pet Care</option>
                      <option value="Other">Other</option>
                    </select>

                    <textarea
                      name="description"
                      placeholder="Detailed Description"
                      className="w-full mb-4 p-2 border rounded h-24"
                      required
                    ></textarea>

                    <div className="relative mb-4">
                      <input
                        name="location"
                        type="text"
                        placeholder="Location"
                        className="w-full p-2 border rounded"
                        value={searchLocation}
                        onChange={(e) => {
                          setSearchLocation(e.target.value);
                          handleLocationSearch(e.target.value);
                        }}
                        required
                      />
                      {locationSuggestions.length > 0 && (
                        <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                          {locationSuggestions.map((location) => (
                            <div
                              key={location.place_id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                handleLocationSelect(location);
                                setFormData({
                                  ...formData,
                                  location: location.description,
                                });
                              }}
                            >
                              {location.description}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <input
                      name="phone"
                      type="tel"
                      placeholder="Phone Number"
                      className="w-full mb-4 p-2 border rounded"
                      required
                    />

                    <input
                      name="address"
                      type="text"
                      placeholder="Address"
                      className="w-full mb-4 p-2 border rounded"
                      required
                    />

                    <textarea
                      name="requirements"
                      placeholder="Special Requirements (Optional)"
                      className="w-full mb-4 p-2 border rounded h-24"
                    ></textarea>

                    <button
                      type="submit"
                      className="w-full bg-[#3498DB] text-white py-2 rounded hover:bg-[#2980B9] transition-colors"
                    >
                      Submit Request
                    </button>
                  </form>
                </div>
              </div>
            )}

            {showVerificationModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-crimson-text">
                      Account Verification - Step {verificationStep} of 4
                    </h2>
                    <button onClick={() => setShowVerificationModal(false)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`w-1/4 h-2 ${
                            step <= verificationStep
                              ? "bg-[#3498DB]"
                              : "bg-gray-200"
                          } ${step === 1 ? "rounded-l" : ""} ${
                            step === 4 ? "rounded-r" : ""
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleVerificationSubmit}>
                    {verificationStep === 1 && (
                      <div>
                        <h3 className="font-crimson-text mb-4">
                          Government-issued ID
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Please upload a clear photo of your government-issued
                          ID (passport, driver's license, etc.)
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setVerificationData((prev) => ({
                              ...prev,
                              idImage: e.target.files[0],
                            }))
                          }
                          className="w-full mb-4"
                          required
                        />
                      </div>
                    )}

                    {verificationStep === 2 && (
                      <div>
                        <h3 className="font-crimson-text mb-4">Selfie Check</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Please take a clear selfie holding your ID next to
                          your face
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setVerificationData((prev) => ({
                              ...prev,
                              selfieImage: e.target.files[0],
                            }))
                          }
                          className="w-full mb-4"
                          required
                        />
                      </div>
                    )}

                    {verificationStep === 3 && (
                      <div>
                        <h3 className="font-crimson-text mb-4">
                          Proof of Residence
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Please upload a recent utility bill or bank statement
                          showing your address
                        </p>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) =>
                            setVerificationData((prev) => ({
                              ...prev,
                              proofOfResidence: e.target.files[0],
                            }))
                          }
                          className="w-full mb-4"
                          required
                        />
                      </div>
                    )}

                    {verificationStep === 4 && (
                      <div>
                        <h3 className="font-crimson-text mb-4">
                          Contact Verification
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              value={verificationData.phoneNumber}
                              onChange={(e) =>
                                setVerificationData((prev) => ({
                                  ...prev,
                                  phoneNumber: e.target.value,
                                }))
                              }
                              className="w-full p-2 border rounded"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email Address
                            </label>
                            <input
                              type="email"
                              value={verificationData.email}
                              onChange={(e) =>
                                setVerificationData((prev) => ({
                                  ...prev,
                                  email: e.target.value,
                                }))
                              }
                              className="w-full p-2 border rounded"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Verification Code
                            </label>
                            <input
                              type="text"
                              value={verificationData.verificationCode}
                              onChange={(e) =>
                                setVerificationData((prev) => ({
                                  ...prev,
                                  verificationCode: e.target.value,
                                }))
                              }
                              className="w-full p-2 border rounded"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between mt-6">
                      {verificationStep > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setVerificationStep((prev) => prev - 1)
                          }
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Back
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={uploadLoading}
                        className="px-4 py-2 bg-[#3498DB] text-white rounded-lg hover:bg-[#2980B9] ml-auto"
                      >
                        {uploadLoading
                          ? "Uploading..."
                          : verificationStep === 4
                          ? "Complete Verification"
                          : "Next"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;