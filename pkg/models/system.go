package models

type SystemMetrics struct {
	Server   ServerMetrics   `json:"server"`
	Database DatabaseMetrics `json:"database"`
	Memory   MemoryMetrics   `json:"memory"`
	CPU      CPUMetrics      `json:"cpu"`
}

type ServerMetrics struct {
	Status  string `json:"status"`
	Version string `json:"version"`
	Uptime  int64  `json:"uptime"`
}

type DatabaseMetrics struct {
	Status      string  `json:"status"`
	Connections int     `json:"connections"`
	Latency     float64 `json:"latency"`
}

type MemoryMetrics struct {
	Used      uint64  `json:"used"`
	Total     uint64  `json:"total"`
	Percent   float64 `json:"percent"`
	Available uint64  `json:"available"`
}

type CPUMetrics struct {
	Usage     float64 `json:"usage"`
	CoreCount int     `json:"core_count"`
	Goroutines int    `json:"goroutines"`
}

type Backup struct {
	Key          string `json:"key"`
	Size         int64  `json:"size"`
	LastModified string `json:"last_modified"`
}
