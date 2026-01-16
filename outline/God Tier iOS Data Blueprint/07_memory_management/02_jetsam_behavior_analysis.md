# Jetsam Behavior Analysis

## Executive Summary

Jetsam is iOS's memory pressure termination mechanism that enforces WidgetKit's 30MB memory limit. Understanding Jetsam behavior is critical for creating stable widgets that survive in production environments.

## Jetsam Fundamentals

### What is Jetsam?

Jetsam is the iOS system daemon (`jetsam`) responsible for terminating processes that exceed their memory allocation limits to maintain system stability and preserve battery life.

```swift
// Jetsam process overview
struct JetsamProcess {
    let pid: pid_t                    // Process ID
    let name: String                  // Process name
    let memoryUsage: Int              // Current memory usage
    let memoryLimit: Int              // Memory limit for process type
    let priority: Int                 // Process priority
    let killPriority: Int            // Priority for termination
    let state: ProcessState          // Current process state
}

enum ProcessState {
    case running
    case suspended
    case terminated(reason: TerminationReason)
}

enum TerminationReason {
    case jetsamMemoryPressure
    case jetsamMemoryLimitExceeded
    case normalExit
}
```

### Memory Limit Enforcement

```swift
// Memory limit calculation for widgets
struct WidgetMemoryLimits {
    
    // Base limits by iOS version
    static func baseLimit(for version: iOSVersion) -> Int {
        switch version {
        case .iOS14, .iOS15, .iOS16:
            return 30 * 1024 * 1024  // 30MB
        case .iOS17, .iOS18:
            return 35 * 1024 * 1024  // 35MB
        default:
            return 30 * 1024 * 1024  // Conservative default
        }
    }
    
    // Adjusted limits by widget family
    static func limit(for family: WidgetFamily, version: iOSVersion) -> Int {
        let base = baseLimit(for: version)
        
        switch family {
        case .systemSmall:
            return Int(Double(base) * 0.6)  // 60% of base
        case .systemMedium:
            return Int(Double(base) * 0.7)  // 70% of base
        case .systemLarge:
            return Int(Double(base) * 0.85) // 85% of base
        case .systemExtraLarge:
            return base                     // 100% of base
        default:
            return Int(Double(base) * 0.7)  // 70% default
        }
    }
    
    // Adjust for device characteristics
    static func adjustedLimit(for device: DeviceCharacteristics) -> Int {
        let baseLimit = limit(for: .systemMedium, version: .current)
        
        // Memory-constrained devices
        if device.totalMemory < 4 * 1024 * 1024 * 1024 { // < 4GB
            return Int(Double(baseLimit) * 0.8) // 80% for low-memory devices
        }
        
        // High-performance devices
        if device.isiPadPro || device.isiPhonePro {
            return Int(Double(baseLimit) * 1.1) // 110% for high-end devices
        }
        
        return baseLimit
    }
}
```

## Jetsam Detection and Monitoring

### Real-Time Memory Monitoring

```swift
import Darwin
import os.signpost

class JetsamMonitor {
    private let memoryLimit: Int
    private let warningThreshold: Double
    private var monitoringTimer: Timer?
    private let log = OSLog(subsystem: "com.yourapp.widget", category: "jetsam")
    
    init(memoryLimit: Int = 30 * 1024 * 1024, warningThreshold: Double = 0.8) {
        self.memoryLimit = memoryLimit
        self.warningThreshold = warningThreshold
    }
    
    func startMonitoring() {
        monitoringTimer = Timer.scheduledTimer(
            withTimeInterval: 1.0,
            repeats: true
        ) { [weak self] _ in
            self?.checkMemoryPressure()
        }
    }
    
    func stopMonitoring() {
        monitoringTimer?.invalidate()
        monitoringTimer = nil
    }
    
    private func checkMemoryPressure() {
        let memoryInfo = getMemoryInfo()
        let usagePercentage = Double(memoryInfo.physicalFootprint) / Double(memoryLimit)
        
        os_signpost(.event, log: log, name: "Memory Check",
                   "Usage: %.1f%%, Footprint: %lld MB", 
                   usagePercentage * 100, memoryInfo.physicalFootprint / 1024 / 1024)
        
        // Check against thresholds
        if usagePercentage >= 1.0 {
            // Critical - likely to be jettisoned
            handleCriticalMemoryPressure()
        } else if usagePercentage >= warningThreshold {
            // Warning - take preventive action
            handleMemoryWarning()
        }
    }
    
    private func getMemoryInfo() -> MemoryInfo {
        var info = task_vm_info()
        var count = mach_msg_type_number_t(MemoryLayout<task_vm_info>.size) / 4
        
        let result = withUnsafeMutablePointer(to: &info) {
            $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
                task_info(mach_task_self_,
                         task_flavor_t(TASK_VM_INFO),
                         $0,
                         &count)
            }
        }
        
        if result == KERN_SUCCESS {
            return MemoryInfo(
                virtualSize: Int(info.virtual_size),
                physicalFootprint: Int(info.physical_footprint),
                residentSize: Int(info.resident_size),
                pageFaults: Int(info.page_faults),
                timestamp: Date()
            )
        }
        
        return MemoryInfo()
    }
    
    private func handleMemoryWarning() {
        os_signpost(.event, log: log, name: "Memory Warning",
                   "Memory usage above threshold: %.1f%%", warningThreshold * 100)
        
        // Take preventive actions
        NotificationCenter.default.post(name: .widgetMemoryWarning, object: nil)
    }
    
    private func handleCriticalMemoryPressure() {
        os_signpost(.event, log: log, name: "Critical Memory",
                   "Critical memory pressure - at risk of jetsam")
        
        // Emergency memory cleanup
        NotificationCenter.default.post(name: .widgetMemoryCritical, object: nil)
        
        // Force immediate cleanup
        emergencyMemoryCleanup()
    }
    
    private func emergencyMemoryCleanup() {
        // Clear all caches
        URLCache.shared.removeAllCachedResponses()
        
        // Clear image caches
        // Clear data caches
        // Force garbage collection
        
        // Notify components
        NotificationCenter.default.post(name: .widgetEmergencyCleanup, object: nil)
    }
}

struct MemoryInfo {
    let virtualSize: Int
    let physicalFootprint: Int
    let residentSize: Int
    let pageFaults: Int
    let timestamp: Date
    
    var physicalFootprintMB: Double {
        return Double(physicalFootprint) / 1024.0 / 1024.0
    }
    
    var residentSizeMB: Double {
        return Double(residentSize) / 1024.0 / 1024.0
    }
}

extension Notification.Name {
    static let widgetMemoryWarning = Notification.Name("WidgetMemoryWarning")
    static let widgetMemoryCritical = Notification.Name("WidgetMemoryCritical")
    static let widgetEmergencyCleanup = Notification.Name("WidgetEmergencyCleanup")
}
```

### Jetsam Event Detection

```swift
// Detect actual jetsam events through system logs
class JetsamEventDetector {
    private let log = OSLog(subsystem: "com.yourapp.widget", category: "jetsam.events")
    
    func detectJetsamEvents() -> [JetsamEvent] {
        var events: [JetsamEvent] = []
        
        // Read system logs for jetsam events
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/usr/bin/log")
        process.arguments = ["show", "--predicate", 
n                            "subsystem == 'com.apple.jetsam'", "--last", "1h"]
        
        let pipe = Pipe()
        process.standardOutput = pipe
        
        do {
            try process.run()
            process.waitUntilExit()
            
            let data = pipe.fileHandleForReading.readDataToEndOfFile()
            if let logContent = String(data: data, encoding: .utf8) {
                events = parseJetsamLog(logContent)
            }
        } catch {
            os_log("Failed to read jetsam logs: %@", log: log, type: .error, error.localizedDescription)
        }
        
        return events
    }
    
    private func parseJetsamLog(_ logContent: String) -> [JetsamEvent] {
        var events: [JetsamEvent] = []
        let lines = logContent.components(separatedBy: .newlines)
        
        for line in lines {
            if line.contains("Jetsam") && line.contains("memory") {
                // Parse jetsam event
                if let event = parseJetsamLine(line) {
                    events.append(event)
                }
            }
        }
        
        return events
    }
    
    private func parseJetsamLine(_ line: String) -> JetsamEvent? {
        // Example line format:
        // "2024-01-15 10:30:45.123456-0800 0x1234 Default 0x0 1234 com.apple.jetsam: (Jetsam) Terminating process 5678 (com.yourapp.widget) for memory limit exceeded"
        
        // Extract process name
        let processPattern = "\\(com\\.[^)]+\\)"
        if let processMatch = line.range(of: processPattern, options: .regularExpression) {
            let processName = String(line[processMatch])
                .replacingOccurrences(of: "(", with: "")
                .replacingOccurrences(of: ")", with: "")
            
            // Extract timestamp
            let datePattern = "\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}"
            if let dateMatch = line.range(of: datePattern, options: .regularExpression) {
                let dateString = String(line[dateMatch])
                let dateFormatter = DateFormatter()
                dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
                
                if let timestamp = dateFormatter.date(from: dateString) {
                    return JetsamEvent(
                        processName: processName,
                        timestamp: timestamp,
                        reason: .memoryLimitExceeded,
                        memoryUsage: 0 // Would need additional parsing
                    )
                }
            }
        }
        
        return nil
    }
}

struct JetsamEvent {
    let processName: String
    let timestamp: Date
    let reason: TerminationReason
    let memoryUsage: Int
    let memoryLimit: Int?
}
```

## Jetsam Prevention Strategies

### Memory Budget Management

```swift
class MemoryBudgetManager {
    private let memoryLimit: Int
    private let safetyMargin: Double
    private var currentUsage: Int
    private let log = OSLog(subsystem: "com.yourapp.widget", category: "memory.budget")
    
    init(memoryLimit: Int, safetyMargin: Double = 0.2) {
        self.memoryLimit = memoryLimit
        self.safetyMargin = safetyMargin
        self.currentUsage = 0
    }
    
    func canAllocate(size: Int) -> Bool {
        let safeLimit = Int(Double(memoryLimit) * (1.0 - safetyMargin))
        return currentUsage + size <= safeLimit
    }
    
    func allocate<T>(_ size: Int, _ closure: () -> T) -> T? {
        guard canAllocate(size: size) else {
            os_log("Cannot allocate %d bytes - would exceed safe limit", 
                   log: log, type: .error, size)
            return nil
        }
        
        currentUsage += size
        
        os_signpost(.event, log: log, name: "Memory Allocation",
                   "Allocated %d bytes, current usage: %d MB", 
                   size, currentUsage / 1024 / 1024)
        
        let result = closure()
        
        // Note: In real implementation, you'd need to track deallocation
        // This is simplified for demonstration
        
        return result
    }
    
    func deallocate(size: Int) {
        currentUsage = max(0, currentUsage - size)
        
        os_signpost(.event, log: log, name: "Memory Deallocation",
                   "Deallocated %d bytes, current usage: %d MB", 
                   size, currentUsage / 1024 / 1024)
    }
    
    func getMemoryReport() -> MemoryReport {
        let safeLimit = Int(Double(memoryLimit) * (1.0 - safetyMargin))
        
        return MemoryReport(
            totalLimit: memoryLimit,
            safeLimit: safeLimit,
            currentUsage: currentUsage,
            available: max(0, safeLimit - currentUsage),
            usagePercentage: Double(currentUsage) / Double(memoryLimit),
            timestamp: Date()
        )
    }
}

struct MemoryReport {
    let totalLimit: Int
    let safeLimit: Int
    let currentUsage: Int
    let available: Int
    let usagePercentage: Double
    let timestamp: Date
    
    var isOverSafeLimit: Bool {
        return currentUsage > safeLimit
    }
    
    var isNearLimit: Bool {
        return usagePercentage > 0.8
    }
}
```

### Adaptive Memory Management

```swift
class AdaptiveMemoryManager {
    private let baseMemoryLimit: Int
    private let deviceCharacteristics: DeviceCharacteristics
    private var currentStrategy: MemoryStrategy
    
    init(baseLimit: Int = 30 * 1024 * 1024) {
        self.baseMemoryLimit = baseLimit
        self.deviceCharacteristics = DeviceCharacteristics.current
        self.currentStrategy = .normal
    }
    
    func getCurrentStrategy() -> MemoryStrategy {
        let memoryInfo = MemoryProfiler.getCurrentMemoryUsage()
        let usagePercentage = Double(memoryInfo.residentSize) / Double(baseMemoryLimit)
        
        // Adapt strategy based on current memory pressure
        if usagePercentage > 0.9 {
            currentStrategy = .critical
        } else if usagePercentage > 0.7 {
            currentStrategy = .conservative
        } else if deviceCharacteristics.isLowMemoryDevice {
            currentStrategy = .conservative
        } else {
            currentStrategy = .normal
        }
        
        return currentStrategy
    }
    
    func executeWithStrategy<T>(_ closure: (MemoryStrategy) -> T) -> T {
        let strategy = getCurrentStrategy()
        
        os_log("Executing with memory strategy: %@", 
               log: .default, type: .info, String(describing: strategy))
        
        return closure(strategy)
    }
}

enum MemoryStrategy {
    case normal      // Full feature set
    case conservative // Reduced features, more caching
    case critical     // Minimal features, emergency mode
    
    var maxDataPoints: Int {
        switch self {
        case .normal: return 1000
        case .conservative: return 500
        case .critical: return 100
        }
    }
    
    var shouldUseComplexEffects: Bool {
        switch self {
        case .normal: return true
        case .conservative: return false
        case .critical: return false
        }
    }
    
    var cacheRetention: TimeInterval {
        switch self {
        case .normal: return 300   // 5 minutes
        case .conservative: return 60    // 1 minute
        case .critical: return 0         // No caching
        }
    }
}
```

## Emergency Response Protocol

```swift
class EmergencyMemoryResponse {
    private let log = OSLog(subsystem: "com.yourapp.widget", category: "emergency")
    
    static let shared = EmergencyMemoryResponse()
    
    private init() {
        setupEmergencyHandlers()
    }
    
    private func setupEmergencyHandlers() {
        // Memory warning notifications
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleMemoryWarning),
            name: UIApplication.didReceiveMemoryWarningNotification,
            object: nil
        )
        
        // Custom widget memory warnings
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleWidgetMemoryWarning),
            name: .widgetMemoryWarning,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleWidgetMemoryCritical),
            name: .widgetMemoryCritical,
            object: nil
        )
    }
    
    @objc private func handleMemoryWarning() {
        os_log("System memory warning received", log: log, type: .warning)
        
        // Immediate actions
        URLCache.shared.removeAllCachedResponses()
        clearImageCaches()
        clearDataCaches()
        
        // Notify components
        NotificationCenter.default.post(name: .widgetEmergencyCleanup, object: nil)
    }
    
    @objc private func handleWidgetMemoryWarning() {
        os_log("Widget memory warning received", log: log, type: .warning)
        
        // Reduce memory usage
        switchToConservativeMode()
    }
    
    @objc private func handleWidgetMemoryCritical() {
        os_log("Widget memory critical received", log: log, type: .fault)
        
        // Emergency mode
        switchToEmergencyMode()
    }
    
    private func switchToConservativeMode() {
        // Reduce data points
        // Disable complex effects
        // Clear non-essential caches
        // Reduce cache retention
    }
    
    private func switchToEmergencyMode() {
        // Minimal data display
        // No caching
        // Basic UI only
        // Emergency fallback data
    }
    
    private func clearImageCaches() {
        // Clear any cached images
        // Release image views
    }
    
    private func clearDataCaches() {
        // Clear data caches
        // Release large objects
        // Force garbage collection
    }
}
```

## Best Practices

1. **Stay Below 20MB**: Conservative memory usage
2. **Monitor Continuously**: Real-time memory tracking
3. **Handle Memory Warnings**: Graceful degradation
4. **Test Memory Pressure**: Simulate low memory conditions
5. **Profile with Instruments**: Regular memory profiling
6. **Use Memory-Mapped Files**: For large datasets
7. **Implement Emergency Protocols**: Critical memory handling
8. **Test on Low-End Devices**: iPhone SE, older iPads

## Conclusion

Understanding and respecting Jetsam behavior is fundamental to WidgetKit survival. Success requires proactive memory management, continuous monitoring, and robust emergency response protocols.

## References

- Apple Developer Documentation: Memory Management
- Darwin Source Code: Jetsam Implementation
- iOS Internals: Memory Pressure Handling
- WWDC Sessions: Performance and Battery Life

## Emergency Contacts

When facing persistent Jetsam issues:

1. **Profile with Instruments** immediately
2. **Check system logs** for jetsam events
3. **Test on multiple devices** and iOS versions
4. **Review memory allocation patterns**
5. **Consider architectural redesign** if necessary

Remember: Prevention is better than cure when it comes to Jetsam termination.